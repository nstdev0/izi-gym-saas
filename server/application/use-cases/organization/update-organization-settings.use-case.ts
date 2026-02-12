
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { Organization } from "@/generated/prisma/client";
import { UpdateOrganizationSettingsInput } from "../../dtos/organizations.dto";
import { clerkClient } from "@clerk/nextjs/server";

export class UpdateOrganizationSettingsUseCase {
    async execute(organizationId: string, input: UpdateOrganizationSettingsInput): Promise<Organization> {
        const { name, image, settings } = input;

        // Fetch existing organization to merge settings
        const currentOrg = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { settings: true, name: true }
        });

        if (!currentOrg) {
            throw new Error("Organization not found");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentSettings = (currentOrg.settings as Record<string, any>) || {};

        // Deep merge logic could be complex, but for now we'll do a shallow merge of top-level keys
        // or a slightly deeper merge if needed. 
        // Since our input settings structure matches the DB structure, let's merge section by section.

        // If a whole section was missing in currentSettings but present in input, the above spread handles it? 
        // No, `...currentSettings.general` would throw if currentSettings.general is undefined.
        // Let's make it safer.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const safeMerge = (current: any, incoming: any) => {
            return { ...current, ...incoming };
        }

        const mergedSettings = {
            general: safeMerge(currentSettings.general || {}, settings?.general || {}),
            operations: safeMerge(currentSettings.operations || {}, settings?.operations || {}),
            notifications: safeMerge(currentSettings.notifications || {}, settings?.notifications || {}),
            appearance: safeMerge(currentSettings.appearance || {}, settings?.appearance || {}),
        }

        const updatedOrg = await prisma.organization.update({
            where: { id: organizationId },
            data: {
                ...(name && { name }),
                ...(image !== undefined && { image }), // Allow clearing image if passed as null/empty? Schema says optional string. 
                settings: mergedSettings,
            },
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
