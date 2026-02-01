import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { orgId, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Buscar la organización por el SLUG de la URL
  const organization = await prisma.organization.findUnique({
    where: { slug: slug },
    select: { id: true, name: true, slug: true },
  });

  // A. Si el slug no existe en la DB -> 404
  if (!organization) {
    return notFound();
  }

  // B. Seguridad SaaS: ¿El usuario pertenece a esta organización?
  // Comparamos el ID de la URL (DB) con el ID de la Sesión (Clerk)
  if (organization.id !== orgId) {
    // Caso: El usuario es de "Iron Gym" pero escribió "/gold-gym/admin"
    // Acción: Lo mandamos a una página de "Sin acceso" o a su propio dashboard

    // Opción A: Error 403
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">No tienes acceso a {slug}</h1>
        <p>Tu organización actual no coincide con la URL solicitada.</p>
        {/* Botón para cambiar de organización en Clerk */}
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] h-screen overflow-hidden">
        <Sidebar slug={slug} className="hidden border-r bg-muted/40 md:flex" />
        <div className="flex flex-col h-full overflow-hidden">
          <Header slug={slug} />
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
