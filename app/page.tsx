import { auth } from "@clerk/nextjs/server";
import { LandingPage } from "@/components/landing-page";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export default async function RootPage() {
  // 1. Verificación básica de sesión en Clerk
  const { userId } = await auth();

  // SI NO HAY SESIÓN -> MOSTRAR LANDING
  if (!userId) {
    return <LandingPage />;
  }

  // SI HAY SESIÓN -> LÓGICA DE REDIRECCIÓN

  // 2. Buscar membresías del usuario para ver ROL y ORGANIZACIÓN
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId: userId, isActive: true },
    include: {
      organization: true, // Traemos la org para obtener el slug
    },
  });

  // --- 3. MANEJO DE LATENCIA (RACE CONDITION) ---
  // Si está logueado en Clerk pero no en DB -> Esperar Webhook
  if (!memberships || memberships.length === 0) {
    const rawUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!rawUser) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500"></div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
            Sincronizando tu cuenta...
          </p>
          <meta httpEquiv="refresh" content="2" />
        </div>
      );
    }
  }

  let dashboardUrl = "/sign-in";

  // TODO: Refactor global GOD role logic. For now, we will assume if any membership is GOD, redirect to system.
  // We can also default to the first active organization.
  const isGod = memberships.some(m => m.role === "GOD");

  if (isGod) {
    dashboardUrl = "/system/dashboard";
  } else if (memberships.length > 0 && memberships[0].organization?.slug) {
    // Redirige al dashboard de la primera organización activa
    dashboardUrl = `/${memberships[0].organization.slug}/admin/dashboard`;
  }

  return <LandingPage dashboardUrl={dashboardUrl} isLoggedIn={true} />;
}
