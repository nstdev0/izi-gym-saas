import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { LandingPage } from "@/components/landing-page";

export default async function RootPage() {
  // 1. Verificación básica de sesión en Clerk
  const { userId } = await auth();

  // SI NO HAY SESIÓN -> MOSTRAR LANDING
  if (!userId) {
    return <LandingPage />;
  }

  // SI HAY SESIÓN -> LÓGICA DE REDIRECCIÓN

  // 2. Buscar usuario en Base de Datos para ver ROL y ORGANIZACIÓN
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true, // Traemos la org para obtener el slug
    },
  });

  // --- 3. MANEJO DE LATENCIA (RACE CONDITION) ---
  // Si está logueado en Clerk pero no en DB -> Esperar Webhook
  if (!user) {
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

  // --- 4. RENDERIZAR LANDING CON CONTEXTO ---
  // Pasamos la info del usuario a la Landing Page para que muestre "Ir al Dashboard"
  // en lugar de "Comenzar" si ya tiene sesión.

  let dashboardUrl = "/sign-in"; // Default fallback (aunque onboarding ya no existe como página, Clerk lo manejará)

  // CASO A: Es el Dueño del Sistema (God Mode)
  if (user.role === "GOD") {
    dashboardUrl = "/system/dashboard";
  }
  // CASO B: Usuario con Organización

  else if (user.organization) {
    dashboardUrl = `/${user.organization.slug}/admin/dashboard`;
  }
  // CASO C: Usuario sin organización
  // Dejamos que Clerk maneje su flujo de crear organización, o lo mandamos al home
  // Si clickea "Ir al Dashboard" y no tiene org, Clerk debería interceptar si configuramos protected routes
  // O podemos mandarlo a /sign-up que lo llevará al flow de Clerk

  return <LandingPage dashboardUrl={dashboardUrl} isLoggedIn={true} />;
}
