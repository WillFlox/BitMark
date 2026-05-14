"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateProfileAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!name || !email) {
    return { error: "Nombre y correo son obligatorios" };
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (existing) {
    return { error: "El correo ya está en uso" };
  }

  await prisma.user.update({ where: { id: userId }, data: { name, email } });

  return { success: "Perfil actualizado correctamente" };
}

export async function updatePasswordAction(
  _prevState: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string } | null> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("password") as string;
  const confirmation = formData.get("password_confirmation") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Completa todos los campos" };
  }

  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
  }

  if (newPassword !== confirmation) {
    return { error: "Las contraseñas no coinciden" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: "La contraseña actual es incorrecta" };
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: "Contraseña actualizada correctamente" };
}

export async function deleteAccountAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: "La contraseña es incorrecta" };
  }

  await prisma.orderItem.deleteMany({ where: { order: { userId } } });
  await prisma.order.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  await signOut({ redirectTo: "/productos" });
  return null;
}
