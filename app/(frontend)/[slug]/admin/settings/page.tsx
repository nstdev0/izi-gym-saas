
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "./settings-form";
import { AppearanceSettings } from "./appearance-settings";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// Since we are in app directory server component, we can fetch data directly or calling our API via fetch()
// For best practice in this architecture, we call the API locally or use the UseCase directly if safe/clean.
// But since we have authentication context, let's just fetch from the API URL for consistency with client-side, 
// OR cleaner: use the controller/usecase directly if we can mock the request/context, 
// OR use prisma directly here since it's a Server Component and we are "backend" in a way.
// Direct Prisma is standard for Server Components in App Router for data fetching.

import { prisma } from "@/server/infrastructure/persistence/prisma";

async function getOrganization(orgId: string) {
    return prisma.organization.findUnique({
        where: { id: orgId },
    });
}

export default async function SettingsPage() {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
        redirect("/");
    }

    const organization = await getOrganization(orgId);

    if (!organization) {
        return <div>Organización no encontrada</div>;
    }

    // Prepare default values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (organization.settings as any) || {};

    // Construct defaultValues object matching our DTO structure
    const defaultValues = {
        name: organization.name,
        image: organization.image || "",
        settings: {
            general: settings.general,
            operations: settings.operations,
            notifications: settings.notifications
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Configuración" }]}>
            <div className="flex flex-col space-y-6">
                <PageHeader
                    title="Configuración"
                    description="Administra los detalles y preferencias de tu organización"
                />

                <div className="container mx-auto max-w-4xl py-6 space-y-6">
                    <SettingsForm defaultValues={defaultValues} />
                    <AppearanceSettings />
                </div>
            </div>
        </DashboardLayout>
    );
}
