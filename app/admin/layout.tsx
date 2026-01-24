import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[auto_1fr] h-screen overflow-hidden">
        <Sidebar className="hidden border-r bg-muted/40 md:block" />
        <div className="flex flex-col h-full overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 lg:p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
