import { SyncUserInput, SyncOrganizationInput, SyncMembershipInput } from "@/server/domain/types/clerk-webhook";

export interface IClerkWebhookRepository {
    /**
     * Obtiene el plan gratuito (free-trial) para asignar a nuevas organizaciones.
     */
    getFreePlan(): Promise<{ id: string; name: string; price: number }>;


    /**
     * Upserts a user and removes any existing user with the same email (zombie prevention).
     */
    syncUser(input: SyncUserInput): Promise<void>;

    /**
     * Deletes a user by ID, ignoring if it doesn't exist.
     */
    deleteUser(id: string): Promise<void>;

    /**
     * Upserts an organization, generating a safe slug if missing, and creates a free-trial if it's new.
     */
    syncOrganization(input: SyncOrganizationInput, freePlanId: string, freePlanName: string, freePlanPrice: number): Promise<void>;

    /**
     * Deletes an organization and its subscriptions in cascade, ignoring if it doesn't exist.
     */
    deleteOrganization(id: string): Promise<void>;

    /**
     * Upserts a user, connects/creates the organization with a safe slug, and assigns the correct role.
     */
    syncMembership(input: SyncMembershipInput, freePlanId: string, freePlanName: string): Promise<void>;

    /**
     * Removes the organizationId from a user and sets them as inactive.
     */
    removeMembership(userId: string): Promise<void>;
}
