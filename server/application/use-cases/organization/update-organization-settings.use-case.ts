
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Organization } from "@/generated/prisma/client";
import { UpdateOrganizationSettingsInput } from "../../dtos/organizations.dto";
import { clerkClient } from "@clerk/nextjs/server";

export class UpdateOrganizationSettingsUseCase {
    async execute(organizationId: string, input: UpdateOrganizationSettingsInput): Promise<Organization> {
        const { name, image, config } = input;

        // Fetch existing organization to merge settings
        const currentOrg = await prisma.organization.findUnique({
            where: { id: organizationId },
            include: { config: true }
        });

        if (!currentOrg) {
            throw new Error("Organization not found");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentSettings = (currentOrg.config as any) || {};

        // Prepare update data for Config
        const configUpdateData: any = {};

        // 1. Identity / General (Currency, Locale, Timezone)
        // DTO has these in `identity`, DB seems to have them at root or mixed.
        // Based on "create" block below, DB keys: locale, timezone, currency.
        if (config?.identity) {
            if (config.identity.currency) configUpdateData.currency = config.identity.currency;
            if (config.identity.locale) configUpdateData.locale = config.identity.locale;
            if (config.identity.timezone) configUpdateData.timezone = config.identity.timezone;
            configUpdateData.identity = {
                ...((currentSettings.identity as object) || {}),
                ...config.identity
            };
        }

        // 2. Access Control
        if (config?.accessControl) {
            configUpdateData.accessControl = {
                ...((currentSettings.accessControl as object) || {}),
                ...config.accessControl
            };
        }

        // 3. Booking
        if (config?.booking) {
            configUpdateData.booking = {
                ...((currentSettings.booking as object) || {}),
                ...config.booking
            };
        }

        // 4. Notifications
        if (config?.notifications) {
            configUpdateData.notifications = {
                ...((currentSettings.notifications as object) || {}),
                ...config.notifications
            };
        }

        // 5. Branding
        if (config?.branding) {
            configUpdateData.branding = {
                ...((currentSettings.branding as object) || {}),
                ...config.branding
            };
        }

        // 6. Billing
        if (config?.billing) {
            configUpdateData.billing = {
                ...((currentSettings.billing as object) || {}),
                ...config.billing
            };
        }

        // 7. Features
        if (config?.features) {
            configUpdateData.features = {
                ...((currentSettings.features as object) || {}),
                ...config.features
            };
        }

        // 8. Staff Settings
        if (config?.staffSettings) {
            configUpdateData.staffSettings = {
                ...((currentSettings.staffSettings as object) || {}),
                ...config.staffSettings
            };
        }


        const updatedOrg = await prisma.organization.update({
            where: { id: organizationId },
            data: {
                ...(name && { name }),
                ...(image !== undefined && { image }),
                config: {
                    upsert: {
                        create: {
                            locale: config?.identity?.locale || "es-PE",
                            timezone: config?.identity?.timezone || "America/Lima",
                            currency: config?.identity?.currency || "PEN",
                            accessControl: config?.accessControl || {},
                            booking: config?.booking || {},
                            notifications: config?.notifications || {},
                            billing: config?.billing || {},
                            branding: config?.branding || {},
                            identity: config?.identity || {},
                            features: config?.features || {},
                            staffSettings: config?.staffSettings || {}
                        },
                        update: configUpdateData
                    }
                }
            },
            include: { config: true }
        });

        // Sync with Clerk if name or slug changed
        // Note: Clerk Webhook will theoretically fire "organization.updated" and try to update DB again.
        // The DB update above is the "source of truth" for this action.
        // The webhook should handle idempotency or just re-apply the same data which is fine.
        if (name && name !== currentOrg.name) {
            try {
                const clerk = await clerkClient();
                await clerk.organizations.updateOrganization(organizationId, {
                    name: name,
                    slug: undefined // We are not allowing slug updates via this simplified settings form yet, but if we did: slug
                });
            } catch (error) {
                console.error("Failed to sync organization update to Clerk", error);
                // We might want to throw or just log. For now log, as DB update succeeded.
            }
        }

        return updatedOrg;
    }
}
