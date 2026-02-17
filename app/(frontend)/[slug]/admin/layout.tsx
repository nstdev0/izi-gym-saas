import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
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
  if (organization.id !== orgId) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold">No tienes acceso a {slug}</h1>
        <p className="text-muted-foreground">Tu organización actual no coincide con la URL solicitada.</p>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="grid h-full w-full md:grid-cols-[auto_1fr] overflow-hidden bg-muted/40">
        <Sidebar slug={slug} className="hidden border-r bg-muted/40 md:flex" />
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <Header slug={slug} mode="organization" />
          <main className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}