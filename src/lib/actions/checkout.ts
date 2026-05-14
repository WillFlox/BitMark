"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CartItem } from "@/types";
import { calcDiscount } from "@/lib/discount";

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

export async function checkoutAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const cart = await getCart();
  if (cart.length === 0) {
    redirect("/carrito?error=Tu+carrito+está+vacío");
  }

  const shippingMethodId = parseInt(formData.get("shipping_method_id") as string);
  const shippingAddress = (formData.get("shipping_address") as string)?.trim();
  const shippingCity = (formData.get("shipping_city") as string)?.trim();
  const shippingPhone = (formData.get("shipping_phone") as string)?.trim();
  const couponCode = (formData.get("coupon_code") as string)?.trim().toUpperCase() || null;

  if (!shippingMethodId || !shippingAddress || !shippingCity || !shippingPhone) {
    redirect("/checkout?error=Completa+todos+los+campos+de+envío");
  }

  const shippingMethod = await prisma.shippingMethod.findUnique({
    where: { id: shippingMethodId },
  });

  if (!shippingMethod) {
    redirect("/checkout?error=Método+de+envío+no+válido");
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
  const total = subtotalAfterDiscount + shippingMethod!.price;
  const userId = parseInt((session.user as { id: string }).id);

  let orderId: number;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingMethodId,
          couponId: coupon?.id ?? null,
          status: "pending",
          subtotal,
          discountAmount,
          shippingCost: shippingMethod!.price,
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

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    orderId = order.id;
  } catch {
    redirect("/checkout?error=Error+al+procesar+el+pedido.+Inténtalo+nuevamente.");
  }

  const cookieStore = await cookies();
  cookieStore.set("cart", "[]", { path: "/", maxAge: 0 });
  cookieStore.set("applied_coupon", "", { path: "/", maxAge: 0 });
  cookieStore.set("last_order_id", orderId!.toString(), {
    path: "/",
    maxAge: 60 * 30,
    httpOnly: true,
  });

  redirect("/mis-pedidos/confirmacion?success=¡Pedido+realizado+con+éxito!");
}
