import { Organization } from "@/server/domain/entities/Organization";
import { Membership } from "@/server/domain/entities/Membership";
import { CreateOrganizationInput } from "@/server/domain/types/organizations";
import { CreateSubscriptionInput } from "@/server/domain/types/subscription";
import { CreateUserInput, UpdateUserInput } from "@/server/domain/types/users";
import { CreateMembershipInput } from "@/server/domain/types/memberships";

// ──────────────────────────────────────────────
// Unit of Work — Domain-Level Transaction Interface
// ──────────────────────────────────────────────
// Use cases call these methods AFTER performing business validations.
// Each method wraps its DB operations in a single atomic transaction.

export interface CreateOrganizationWithOwnerParams {
    orgData: CreateOrganizationInput & { planId: string; planName: string; config: unknown };
    subscriptionData: CreateSubscriptionInput;
    ownerData: CreateUserInput | { id: string; data: UpdateUserInput };
    isNewUser: boolean;
}

export interface UpgradeOrganizationPlanParams {
    organizationId: string;
    planId: string;
    planName: string;
    planPrice: number;
}

export interface UpdateOrganizationSettingsParams {
    organizationId: string;
    name?: string;
    image?: string;
    config?: Record<string, unknown>;
}

export interface CreateMembershipAndActivateParams {
    membershipData: CreateMembershipInput;
    organizationId: string;
}

export interface IUnitOfWork {
    // ─── Organization Operations ─────────────────────────────
    createOrganizationWithOwner(params: CreateOrganizationWithOwnerParams): Promise<Organization>;
    upgradeOrganizationPlan(params: UpgradeOrganizationPlanParams): Promise<Organization>;
    updateOrganizationSettings(params: UpdateOrganizationSettingsParams): Promise<Organization>;

    // ─── Membership Operations ───────────────────────────────
    /** Creates a membership and activates the member — atomically. */
    createMembershipAndActivate(params: CreateMembershipAndActivateParams): Promise<Membership>;
    /** Cancels a membership and deactivates the member — atomically. */
    cancelMembershipAndDeactivate(membershipId: string, organizationId: string): Promise<void>;
    /** Soft-deletes a membership and deactivates the member — atomically. */
    deleteMembershipAndDeactivate(membershipId: string, organizationId: string): Promise<void>;
    /** Restores a membership and re-activates the member (if status is ACTIVE) — atomically. */
    restoreMembershipAndActivate(membershipId: string, organizationId: string): Promise<void>;
}

