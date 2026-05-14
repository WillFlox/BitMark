"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionUser } from "@/types";

export async function toggleWishlist(formData: FormData) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    redirect("/login?redirect=/favoritos");
  }

  const productId = parseInt(formData.get("product_id") as string);
  const userId = parseInt(user.id);
  const returnPath = (formData.get("return_path") as string) || "/productos";

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
  }

  revalidatePath(returnPath);
  revalidatePath("/favoritos");
  redirect(`${returnPath}?wishlist=${existing ? "removed" : "added"}`);
}

export async function removeFromWishlist(formData: FormData) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    redirect("/login");
  }

  const productId = parseInt(formData.get("product_id") as string);
  const userId = parseInt(user.id);

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId },
  });

  revalidatePath("/favoritos");
  redirect("/favoritos?removed=1");
}

export async function getWishlistProductIds(userId: number): Promise<number[]> {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}

export async function addToWishlistSilent(
  productId: number
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return { ok: false, message: "Debes iniciar sesión para guardar favoritos." };
  }

  const userId = parseInt(user.id);

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });

  revalidatePath("/favoritos");
  return { ok: true, message: "Guardado en favoritos" };
}
