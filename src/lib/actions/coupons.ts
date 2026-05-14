"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

import { calcDiscount } from "@/lib/discount";

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  error?: string;
}

export async function getAppliedCoupon(): Promise<CouponValidationResult | null> {
  const cookieStore = await cookies();
  const couponCookie = cookieStore.get("applied_coupon");
  if (!couponCookie?.value) return null;
  return { valid: true, code: couponCookie.value };
}

export async function validateCouponCode(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!coupon || !coupon.active) {
    return { valid: false, error: "Cupón no válido o inactivo." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false, error: "Este cupón ha expirado." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Este cupón ha alcanzado el límite de usos." };
  }

  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      error: `Este cupón requiere un mínimo de $${coupon.minPurchase.toFixed(2)}.`,
    };
  }

  const discountAmount = calcDiscount(coupon.discountType, coupon.discountValue, subtotal);

  return {
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount,
  };
}

export async function applyCoupon(formData: FormData): Promise<void> {
  const code = (formData.get("coupon_code") as string)?.trim().toUpperCase();
  if (!code) {
    redirect("/carrito?error=Ingresa+un+código+de+cupón");
  }

  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");
  let subtotal = 0;
  if (cartCookie?.value) {
    try {
      const cart = JSON.parse(cartCookie.value);
      subtotal = cart.reduce(
        (sum: number, item: { price: number; quantity: number }) =>
          sum + item.price * item.quantity,
        0
      );
    } catch {
      subtotal = 0;
    }
  }

  const result = await validateCouponCode(code, subtotal);

  if (!result.valid) {
    const msg = encodeURIComponent(result.error ?? "Cupón no válido");
    redirect(`/carrito?error=${msg}`);
  }

  cookieStore.set("applied_coupon", result.code!, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
  });

  revalidatePath("/carrito");
  revalidatePath("/checkout");
  redirect("/carrito?success=¡Cupón+aplicado+correctamente!");
}

export async function removeCoupon(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("applied_coupon", "", { path: "/", maxAge: 0 });
  revalidatePath("/carrito");
  revalidatePath("/checkout");
  redirect("/carrito?success=Cupón+eliminado");
}

// ─── Admin actions ─────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (!session || user?.role !== "admin") {
    redirect("/login");
  }
}

export async function createCoupon(formData: FormData): Promise<void> {
  await requireAdmin();

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const description = (formData.get("description") as string)?.trim() || null;
  const discountType = formData.get("discount_type") as string;
  const discountValue = parseFloat(formData.get("discount_value") as string);
  const minPurchase = parseFloat(formData.get("min_purchase") as string) || 0;
  const maxUsesRaw = formData.get("max_uses") as string;
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw) : null;
  const expiresAtRaw = formData.get("expires_at") as string;
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;

  if (!code || !discountType || isNaN(discountValue) || discountValue <= 0) {
    redirect("/admin/coupons?error=Datos+inválidos");
  }

  if (discountType === "percentage" && discountValue > 100) {
    redirect("/admin/coupons?error=El+porcentaje+no+puede+superar+100");
  }

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) {
    redirect("/admin/coupons?error=Ya+existe+un+cupón+con+ese+código");
  }

  await prisma.coupon.create({
    data: {
      code,
      description,
      discountType,
      discountValue,
      minPurchase,
      maxUses,
      expiresAt,
      active: true,
    },
  });

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?success=Cupón+creado+correctamente");
}

export async function toggleCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = parseInt(formData.get("coupon_id") as string);
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) redirect("/admin/coupons?error=Cupón+no+encontrado");

  await prisma.coupon.update({
    where: { id },
    data: { active: !coupon!.active },
  });

  revalidatePath("/admin/coupons");
  redirect(
    `/admin/coupons?success=Cupón+${coupon!.active ? "desactivado" : "activado"}+correctamente`
  );
}

export async function deleteCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = parseInt(formData.get("coupon_id") as string);
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?success=Cupón+eliminado");
}
