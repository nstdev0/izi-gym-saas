import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { Header } from "@/components/header";
import { GodSidebar } from "@/components/god-sidebar";
import { requireGodMode } from "@/server/infrastructure/auth/god-mode";

export default async function GodModeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Verificamos si es ADMIN en la organización maestra
    await requireGodMode();

    return (
        <DashboardProvider>
            <div className="grid h-[100dvh] w-full md:grid-cols-[auto_1fr] overflow-hidden bg-background">
                <GodSidebar className="hidden md:flex border-r" />
                <div className="flex flex-col h-full min-h-0 overflow-hidden relative">
                    <Header slug="god" mode="system" />
                    <main className="flex-1 overflow-y-auto w-full max-w-full">
                        <div className="container mx-auto max-w-7xl py-6 px-4 md:px-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </DashboardProvider>
    );
}
