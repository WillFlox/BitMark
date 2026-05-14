import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = parseInt((session.user as { id: string }).id);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { orders: true } } },
  });

  if (!dbUser) redirect("/login");

  return (
    <>
      <style>{`
        .profile-title { background: linear-gradient(45deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: fadeInLeft .5s ease both; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--btn-from), var(--btn-to)); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 8px 24px rgba(99,102,241,.4); animation: popIn .5s ease both; }
        .section-label { font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); margin-bottom: 4px; }
        .danger-zone { border: 1px solid rgba(248,113,113,.25) !important; background: rgba(248,113,113,.04) !important; }
        .danger-zone .card-header { background: rgba(248,113,113,.1) !important; border-bottom: 1px solid rgba(248,113,113,.2) !important; color: var(--danger) !important; }
        .profile-card { animation: fadeInUp .45s ease both; }
        .profile-card:nth-child(2) { animation-delay: .08s; }
        .profile-card:nth-child(3) { animation-delay: .16s; }
        .role-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: .72rem; font-weight: 600; background: rgba(129,140,248,.15); border: 1px solid rgba(129,140,248,.3); color: var(--accent); }
        .role-badge.admin { background: rgba(251,191,36,.15); border-color: rgba(251,191,36,.3); color: var(--warning); }
      `}</style>
      <ProfileForm
        user={{
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          createdAt: dbUser.createdAt.toISOString(),
          orderCount: dbUser._count.orders,
        }}
      />
    </>
  );
}
