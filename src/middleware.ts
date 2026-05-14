import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const adminPaths = ["/admin"];
  const authPaths = ["/checkout", "/mis-pedidos", "/perfil"];

  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const role = (session.user as { role?: string })?.role;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/productos", req.url));
    }
  }

  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?error=Debes+iniciar+sesión+para+continuar`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/mis-pedidos/:path*", "/perfil"],
};
