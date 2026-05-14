"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/productos",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos" };
    }
    throw error;
  }
  return null;
}

export async function registerAction(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmation = formData.get("password_confirmation") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  if (password !== confirmation) {
    return { error: "Las contraseñas no coinciden" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "El correo ya está registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, role: "customer" },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/productos",
    });
  } catch (error) {
    throw error;
  }
  return null;
}

export async function logoutAction() {
  await signOut({ redirectTo: "/productos" });
}
