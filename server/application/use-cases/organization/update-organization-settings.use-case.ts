
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Organization } from "@/generated/prisma/client";
import { UpdateOrganizationSettingsInput } from "../../dtos/organizations.dto";

export class UpdateOrganizationSettingsUseCase {
    async execute(organizationId: string, input: UpdateOrganizationSettingsInput): Promise<Organization> {
        const { name, image, settings } = input;

        // Fetch existing organization to merge settings
        const currentOrg = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { settings: true }
        });

        if (!currentOrg) {
            throw new Error("Organization not found");
        }

        const currentSettings = (currentOrg.settings as Record<string, any>) || {};

        // Deep merge logic could be complex, but for now we'll do a shallow merge of top-level keys
        // or a slightly deeper merge if needed. 
        // Since our input settings structure matches the DB structure, let's merge section by section.

        const newSettings = {
            ...currentSettings,
            ...(settings?.general ? { general: { ...currentSettings.general, ...settings.general } } : {}),
            ...(settings?.operations ? { operations: { ...currentSettings.operations, ...settings.operations } } : {}),
            ...(settings?.notifications ? { notifications: { ...currentSettings.notifications, ...settings.notifications } } : {}),
        };

        // If a whole section was missing in currentSettings but present in input, the above spread handles it? 
        // No, `...currentSettings.general` would throw if currentSettings.general is undefined.
        // Let's make it safer.

        const safeMerge = (current: any, incoming: any) => {
            return { ...current, ...incoming };
        }

        const mergedSettings = {
            general: safeMerge(currentSettings.general || {}, settings?.general || {}),
            operations: safeMerge(currentSettings.operations || {}, settings?.operations || {}),
            notifications: safeMerge(currentSettings.notifications || {}, settings?.notifications || {}),
        }

        return prisma.organization.update({
            where: { id: organizationId },
            data: {
                ...(name && { name }),
                ...(image !== undefined && { image }), // Allow clearing image if passed as null/empty? Schema says optional string. 
                settings: mergedSettings,
            },
        });
    }
}
