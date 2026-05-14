"use server";

import { auth } from "@/lib/auth";
import { finalizeStripePaymentFromIntent } from "@/lib/payments/finalize-stripe-order";

export type ConfirmCheckoutResult =
  | { orderId: number }
  | { error: string };

export async function confirmEmbeddedPayment(
  paymentIntentId: string
): Promise<ConfirmCheckoutResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { error: "Debes iniciar sesión para continuar." };
    }

    const userId = parseInt((session.user as { id: string }).id);
    const result = await finalizeStripePaymentFromIntent(paymentIntentId, userId);

    if (!result.ok) {
      if (result.reason === "forbidden") {
        return { error: "No tienes permiso para confirmar este pago." };
      }
      return { error: "No se pudo confirmar el pago. Inténtalo nuevamente." };
    }

    return { orderId: result.orderId };
  } catch {
    return { error: "No se pudo confirmar el pago. Inténtalo nuevamente." };
  }
}
