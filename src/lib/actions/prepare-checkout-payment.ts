"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CartItem } from "@/types";
import { calcDiscount } from "@/lib/discount";
import { getStripeClient } from "@/lib/stripe";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";

export type PrepareCheckoutResult =
  | {
      clientSecret: string;
      customerSessionClientSecret: string | null;
      orderId: number;
    }
  | { error: string };

async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");
  if (!cartCookie?.value) return [];
  try {
    return JSON.parse(cartCookie.value);
  } catch {
    return [];
  }
}

export async function prepareCheckoutPayment(
  formData: FormData
): Promise<PrepareCheckoutResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Debes iniciar sesión para continuar." };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { error: "Stripe no está configurado. Añade STRIPE_SECRET_KEY en .env.local." };
    }

    const cart = await getCart();
    if (cart.length === 0) {
      return { error: "Tu carrito está vacío." };
    }

    const shippingMethodId = parseInt(formData.get("shipping_method_id") as string);
    const shippingAddress = (formData.get("shipping_address") as string)?.trim();
    const shippingCity = (formData.get("shipping_city") as string)?.trim();
    const shippingPhone = (formData.get("shipping_phone") as string)?.trim();
    const couponCode = (formData.get("coupon_code") as string)?.trim().toUpperCase() || null;

    if (!shippingMethodId || !shippingAddress || !shippingCity || !shippingPhone) {
      return { error: "Completa todos los campos de envío." };
    }

    const shippingMethod = await prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });

    if (!shippingMethod) {
      return { error: "Método de envío no válido." };
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let coupon = null;
    let discountAmount = 0;

    if (couponCode) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });

      if (
        coupon &&
        coupon.active &&
        !(coupon.expiresAt && coupon.expiresAt < new Date()) &&
        !(coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) &&
        subtotal >= coupon.minPurchase
      ) {
        discountAmount = calcDiscount(coupon.discountType, coupon.discountValue, subtotal);
      } else {
        coupon = null;
      }
    }

    const subtotalAfterDiscount = subtotal - discountAmount;
    const total = subtotalAfterDiscount + shippingMethod.price;
    const totalCents = Math.round(total * 100);

    if (totalCents < 50) {
      return { error: "El total mínimo para pagar con Stripe es de $0.50." };
    }

    const userId = parseInt((session.user as { id: string }).id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return { error: "No se encontró tu cuenta. Vuelve a iniciar sesión." };
    }

    let orderId: number;

    try {
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            userId,
            shippingMethodId,
            couponId: coupon?.id ?? null,
            status: "awaiting_payment",
            subtotal,
            discountAmount,
            shippingCost: shippingMethod.price,
            total,
            shippingAddress,
            shippingCity,
            shippingPhone,
          },
        });

        for (const item of cart) {
          const product = await tx.product.findUnique({ where: { id: item.id } });
          if (!product) throw new Error(`Producto ${item.id} no encontrado`);

          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: product.id,
              quantity: item.quantity,
              unitPrice: item.price,
              subtotal: item.price * item.quantity,
            },
          });
        }

        return newOrder;
      });

      orderId = order.id;
    } catch {
      return { error: "Error al procesar el pedido. Inténtalo nuevamente." };
    }

    try {
      const stripe = getStripeClient();
      const customerId = await getOrCreateStripeCustomer(user);

      const customerSession = await stripe.customerSessions.create({
        customer: customerId,
        components: {
          payment_element: {
            enabled: true,
            features: {
              payment_method_redisplay: "enabled",
              payment_method_save: "enabled",
              payment_method_save_usage: "off_session",
              payment_method_remove: "enabled",
            },
          },
        },
      });

      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalCents,
        currency: "usd",
        customer: customerId,
        setup_future_usage: "off_session",
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        metadata: {
          orderId: String(orderId),
          userId: String(userId),
        },
      });

      if (!paymentIntent.client_secret) {
        throw new Error("Stripe no devolvió un client secret.");
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { stripeSessionId: paymentIntent.id },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        customerSessionClientSecret: customerSession.client_secret,
        orderId,
      };
    } catch {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "cancelled" },
      });
      return { error: "No se pudo iniciar el pago con Stripe. Inténtalo nuevamente." };
    }
  } catch {
    return { error: "No se pudo preparar el pago. Inténtalo nuevamente." };
  }
}
