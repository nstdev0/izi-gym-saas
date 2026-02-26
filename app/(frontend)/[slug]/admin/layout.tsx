import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId, orgSlug } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (slug === "god") {
    redirect("/god/dashboard");
  }

  if (orgSlug !== slug) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <h1 className="text-2xl font-bold">No tienes acceso a {slug}</h1>
        <p className="text-muted-foreground text-center">Tu organización actual no coincide con la URL solicitada.</p>
      </div>
    );
  }

  return (
    <DashboardProvider>
      <div className="grid h-full w-full md:grid-cols-[auto_1fr] overflow-hidden bg-muted/40">
        <Sidebar slug={slug} className="hidden border-r bg-muted/40 md:flex" />
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <Header slug={slug} mode="organization" />
          <main className="flex-1 overflow-y-auto px-4 scrollbar-hide bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}