"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CartItem } from "@/types";

async function getCart(): Promise<CartItem[]> {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");
  if (!cartCookie?.value) return [];
  try {
    return JSON.parse(cookieStore.get("cart")!.value);
  } catch {
    return [];
  }
}

async function saveCart(cart: CartItem[]) {
  const cookieStore = await cookies();
  cookieStore.set("cart", JSON.stringify(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
  });
}

export async function addToCart(formData: FormData) {
  const productId = parseInt(formData.get("product_id") as string);
  const quantity = Math.max(1, parseInt(formData.get("quantity") as string) || 1);

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || !product.active) {
    redirect("/carrito?error=Producto+no+encontrado");
  }

  if (product.productType === "external_game") {
    redirect("/carrito?error=Los+juegos+externos+no+se+agregan+al+carrito");
  }

  const cart = await getCart();
  const existingIndex = cart.findIndex((i) => i.id === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    });
  }

  await saveCart(cart);
  revalidatePath("/carrito");
  redirect("/carrito?success=Producto+agregado+al+carrito");
}

export async function updateCartItem(formData: FormData) {
  const productId = parseInt(formData.get("product_id") as string);
  const quantity = Math.max(1, parseInt(formData.get("quantity") as string) || 1);

  const cart = await getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity = quantity;
    await saveCart(cart);
  }

  revalidatePath("/carrito");
  redirect("/carrito?success=Carrito+actualizado");
}

export async function removeFromCart(formData: FormData) {
  const productId = parseInt(formData.get("product_id") as string);

  const cart = await getCart();
  const newCart = cart.filter((i) => i.id !== productId);
  await saveCart(newCart);

  revalidatePath("/carrito");
  redirect("/carrito?success=Producto+eliminado+del+carrito");
}

export async function clearCart() {
  await saveCart([]);
  revalidatePath("/carrito");
  redirect("/carrito?success=Carrito+vaciado");
}

export async function getCartFromCookie(): Promise<CartItem[]> {
  return getCart();
}
