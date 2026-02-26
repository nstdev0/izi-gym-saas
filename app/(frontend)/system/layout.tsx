
import { Sidebar } from "@/components/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { Header } from "@/components/header";
import { prisma } from "@/server/infrastructure/persistence/prisma";

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check Prisma for GOD role in any membership
  const godMembership = await prisma.organizationMembership.findFirst({
    where: { userId: user.id, role: "GOD", isActive: true }
  });

  if (!godMembership) {
    console.log("⛔ Access Denied: User is not GOD", user.id);
    return notFound();
  }

  return (
    <DashboardProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] h-screen overflow-hidden">
        <Sidebar mode="system" className="hidden border-r bg-muted/40 md:flex" />
        <div className="flex flex-col h-full overflow-hidden">
          <Header mode="system" />
          <main className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-8 bg-muted/10 h-full">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
