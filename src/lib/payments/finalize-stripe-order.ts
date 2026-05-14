import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";

type FinalizeResult =
  | { ok: true; orderId: number }
  | { ok: false; reason: "not_paid" | "not_found" | "forbidden" };

async function completeAwaitingPaymentOrder(
  orderId: number,
  userId?: number
): Promise<FinalizeResult> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return { ok: false, reason: "not_found" };
  }

  if (userId !== undefined && order.userId !== userId) {
    return { ok: false, reason: "forbidden" };
  }

  if (order.status !== "awaiting_payment") {
    return { ok: true, orderId: order.id };
  }

  let finalized = false;

  await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!currentOrder || currentOrder.status !== "awaiting_payment") {
      return;
    }

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "awaiting_payment" },
      data: { status: "pending" },
    });

    if (updated.count === 0) {
      return;
    }

    finalized = true;

    for (const item of currentOrder.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (currentOrder.couponId) {
      await tx.coupon.update({
        where: { id: currentOrder.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  if (!finalized) {
    return { ok: true, orderId: order.id };
  }

  try {
    await sendOrderConfirmationEmail(orderId);
  } catch (error) {
    console.error(`[email] No se pudo enviar la confirmación del pedido #${orderId}`, error);
  }

  if (userId !== undefined) {
    const cookieStore = await cookies();
    cookieStore.set("cart", "[]", { path: "/", maxAge: 0 });
    cookieStore.set("applied_coupon", "", { path: "/", maxAge: 0 });
    cookieStore.set("last_order_id", order.id.toString(), {
      path: "/",
      maxAge: 60 * 30,
      httpOnly: true,
    });
  }

  return { ok: true, orderId: order.id };
}

export async function finalizeStripePaymentFromIntent(
  paymentIntentId: string,
  userId?: number
): Promise<FinalizeResult> {
  const stripe = getStripeClient();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return { ok: false, reason: "not_paid" };
  }

  const orderId = Number(paymentIntent.metadata?.orderId);
  if (!orderId) {
    return { ok: false, reason: "not_found" };
  }

  return completeAwaitingPaymentOrder(orderId, userId);
}

export async function finalizeStripeOrder(
  sessionId: string,
  userId?: number
): Promise<FinalizeResult> {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { ok: false, reason: "not_paid" };
  }

  const orderId = Number(session.metadata?.orderId);
  if (!orderId) {
    return { ok: false, reason: "not_found" };
  }

  return completeAwaitingPaymentOrder(orderId, userId);
}
