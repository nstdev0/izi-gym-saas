import { UpdateOrganizationSettingsInput } from "../../dtos/organizations.dto";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { IAuthProvider } from "../../services/auth-provider.interface";
import { IPermissionService } from "@/server/application/services/permission.service.interface";
import { IUnitOfWork } from "../../services/unit-of-work.interface";

export class UpdateOrganizationSettingsUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
        private readonly authService: IAuthProvider,
        private readonly permissions: IPermissionService,
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    async execute(input: UpdateOrganizationSettingsInput): Promise<void> {
        this.permissions.require('org:update');
        const { name, image, config } = input;

        // ── 1. Business Validations ────────────────────────────
        const session = await this.authService.getSession();
        const organizationId = session?.orgId;

        if (!session?.userId || !organizationId) {
            throw new Error("No autenticado o sin organización");
        }

        const currentOrg = await this.repository.findUnique({ id: organizationId });
        if (!currentOrg) {
            throw new Error("Organization not found");
        }

        // ── 2. Build Config Update ─────────────────────────────
        const currentSettings = (currentOrg.config as any) || {};
        const configUpdateData: Record<string, unknown> = {};

        if (config?.identity) {
            if (config.identity.currency) configUpdateData.currency = config.identity.currency;
            if (config.identity.locale) configUpdateData.locale = config.identity.locale;
            if (config.identity.timezone) configUpdateData.timezone = config.identity.timezone;
            configUpdateData.identity = {
                ...((currentSettings.identity as object) || {}),
                ...config.identity
            };
        }

        if (config?.accessControl) {
            configUpdateData.accessControl = {
                ...((currentSettings.accessControl as object) || {}),
                ...config.accessControl
            };
        }

        if (config?.booking) {
            configUpdateData.booking = {
                ...((currentSettings.booking as object) || {}),
                ...config.booking
            };
        }

        if (config?.notifications) {
            configUpdateData.notifications = {
                ...((currentSettings.notifications as object) || {}),
                ...config.notifications
            };
        }

        if (config?.branding) {
            configUpdateData.branding = {
                ...((currentSettings.branding as object) || {}),
                ...config.branding
            };
        }

        if (config?.billing) {
            configUpdateData.billing = {
                ...((currentSettings.billing as object) || {}),
                ...config.billing
            };
        }

        if (config?.features) {
            configUpdateData.features = {
                ...((currentSettings.features as object) || {}),
                ...config.features
            };
        }

        if (config?.staffSettings) {
            configUpdateData.staffSettings = {
                ...((currentSettings.staffSettings as object) || {}),
                ...config.staffSettings
            };
        }

        // ── 3. Delegate Atomic Write to UoW ────────────────────
        await this.unitOfWork.updateOrganizationSettings({
            organizationId,
            ...(name && { name }),
            ...(image !== undefined && { image }),
            ...(Object.keys(configUpdateData).length > 0 && { config: configUpdateData }),
        });

        // ── 4. Sync with Clerk (External — outside transaction) ─
        if (name && name !== currentOrg.name) {
            try {
                const clerk = await this.authService.getClient();
                await clerk.organizations.updateOrganization(organizationId, {
                    name: name,
                    slug: undefined
                });
            } catch (error) {
                console.error("Failed to sync organization update to Clerk", error);
            }
        }
    }
}
