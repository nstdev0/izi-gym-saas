"use client";

import { useUserProfile } from "@/hooks/users/use-users";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "./profile-form";
import { PreferencesForm } from "./preferences-form";

export default function ProfileViewPage() {
    const { data: user, isLoading } = useUserProfile();

    if (isLoading) {
        return <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Perfil" }]}><div className="flex justify-center p-8">Cargando...</div></DashboardLayout>;
    }

    if (!user) {
        return <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Perfil" }]}><div>Usuario no encontrado</div></DashboardLayout>;
    }

    const defaultProfileValues = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        image: user.image || "",
    };

    // Parse preferences safely
    const preferences = (user.preferences as Record<string, any>) || {};
    const notifications = (preferences.notifications as { email?: boolean, push?: boolean }) || {};

    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Perfil" }]}>
            <div className="flex flex-col space-y-6">
                <PageHeader
                    title="Tu Perfil"
                    description="Administra tu información personal y preferencias de la cuenta"
                />

                <div className="container mx-auto max-w-4xl py-6">
                    <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="profile">Perfil</TabsTrigger>
                            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile">
                            <ProfileForm
                                defaultValues={defaultProfileValues}
                                email={user.email}
                            />
                        </TabsContent>

                        <TabsContent value="preferences">
                            <PreferencesForm
                                initialNotifications={notifications}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </DashboardLayout>
    );
}
