import { PrismaClient, Role } from "@/generated/prisma/client";
import { Organization } from "@/server/domain/entities/Organization";
import { Membership } from "@/server/domain/entities/Membership";
import { OrganizationMapper } from "./mappers/organizations.mapper";
import { MembershipMapper } from "./mappers/memberships.mapper";
import { translatePrismaError } from "./prisma-error-translator";
import { NotFoundError } from "@/server/domain/errors/common";
import type {
    IUnitOfWork,
    CreateOrganizationWithOwnerParams,
    UpgradeOrganizationPlanParams,
    UpdateOrganizationSettingsParams,
    CreateMembershipAndActivateParams,
    SyncStripeSubscriptionEventParams,
} from "@/server/application/services/unit-of-work.interface";

// ──────────────────────────────────────────────
// Prisma Unit of Work
// ──────────────────────────────────────────────
// Implements IUnitOfWork using prisma.$transaction() for atomicity.
// All multi-write operations are wrapped in interactive transactions.

export class PrismaUnitOfWork implements IUnitOfWork {
    private readonly orgMapper = new OrganizationMapper();
    private readonly membershipMapper = new MembershipMapper();

    constructor(private readonly prisma: PrismaClient) { }

    // ─── Create Organization + Subscription + Owner ──────────────
    async createOrganizationWithOwner(
        params: CreateOrganizationWithOwnerParams,
    ): Promise<Organization> {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const org = await tx.organization.create({
                    data: {
                        name: params.orgData.name,
                        slug: params.orgData.slug,
                        organizationId: params.orgData.slug,
                        organizationPlanId: params.orgData.planId,
                        organizationPlan: params.orgData.planName,
                        config: {
                            create: params.orgData.config as any,
                        },
                    },
                });

                await tx.subscription.create({
                    data: {
                        organizationId: org.id,
                        organizationPlanId: params.subscriptionData.planId,
                        status: params.subscriptionData.status,
                        pricePaid: params.subscriptionData.pricePaid,
                        currentPeriodStart: params.subscriptionData.currentPeriodStart ?? new Date(),
                        currentPeriodEnd: params.subscriptionData.currentPeriodEnd !== null ? params.subscriptionData.currentPeriodEnd : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        cancelAtPeriodEnd: params.subscriptionData.cancelAtPeriodEnd ?? false,
                    },
                });

                if (params.isNewUser) {
                    const createData = params.ownerData as {
                        id?: string;
                        email: string;
                        image?: string | null;
                        role: string;
                        isActive: boolean;
                    };
                    await tx.user.create({
                        data: {
                            id: createData.id,
                            email: createData.email,
                            image: createData.image,
                            isActive: createData.isActive,
                            memberships: {
                                create: {
                                    organizationId: org.id,
                                    role: createData.role as Role,
                                    isActive: true
                                }
                            }
                        },
                    });
                } else {
                    const updatePayload = params.ownerData as { id: string; data: Record<string, unknown> };
                    // We upsert the membership since the user already exists globally
                    await tx.organizationMembership.upsert({
                        where: {
                            userId_organizationId: {
                                userId: updatePayload.id,
                                organizationId: org.id
                            }
                        },
                        create: {
                            userId: updatePayload.id,
                            organizationId: org.id,
                            role: updatePayload.data.role as Role,
                            isActive: true
                        },
                        update: {
                            role: updatePayload.data.role as Role,
                            isActive: true
                        }
                    });
                }

                const fullOrg = await tx.organization.findUnique({
                    where: { id: org.id },
                    include: { config: true, plan: true },
                });

                return fullOrg!;
            });

            return this.orgMapper.toDomain(result);
        } catch (error) {
            translatePrismaError(error, "Organización");
        }
    }

    // ─── Upgrade Organization Plan ───────────────────────────────
    async upgradeOrganizationPlan(
        params: UpgradeOrganizationPlanParams,
    ): Promise<Organization> {
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.organization.update({
                    where: { id: params.organizationId },
                    data: {
                        organizationPlanId: params.planId,
                        organizationPlan: params.planName,
                    },
                });

                await tx.subscription.update({
                    where: { organizationId: params.organizationId },
                    data: { pricePaid: params.planPrice },
                });
            });

            const updatedOrg = await this.prisma.organization.findUnique({
                where: { id: params.organizationId },
                include: { config: true, plan: true },
            });

            if (!updatedOrg) throw new NotFoundError("Organization not found after upgrade");
            return this.orgMapper.toDomain(updatedOrg);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            translatePrismaError(error, "Organización");
        }
    }

    // ─── Update Organization Settings ────────────────────────────
    async updateOrganizationSettings(
        params: UpdateOrganizationSettingsParams,
    ): Promise<Organization> {
        try {
            await this.prisma.$transaction(async (tx) => {
                if (params.name || params.image !== undefined) {
                    await tx.organization.update({
                        where: { id: params.organizationId },
                        data: {
                            ...(params.name && { name: params.name }),
                            ...(params.image !== undefined && { image: params.image }),
                        },
                    });
                }

                if (params.config) {
                    const payload: any = { ...params.config };
                    if (params.config.identity) {
                        const identity = params.config.identity as Record<string, unknown>;
                        if (identity.locale) payload.locale = identity.locale;
                        if (identity.timezone) payload.timezone = identity.timezone;
                        if (identity.currency) payload.currency = identity.currency;
                    }

                    await tx.organization.update({
                        where: { id: params.organizationId },
                        data: {
                            config: {
                                upsert: { create: payload, update: payload },
                            },
                        },
                    });
                }
            });

            const updatedOrg = await this.prisma.organization.findUnique({
                where: { id: params.organizationId },
                include: { config: true, plan: true },
            });

            if (!updatedOrg) throw new NotFoundError("Organization not found after settings update");
            return this.orgMapper.toDomain(updatedOrg);
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            translatePrismaError(error, "Organización");
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  MEMBERSHIP OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    // ─── Create Membership + Activate Member ─────────────────────
    async createMembershipAndActivate(
        params: CreateMembershipAndActivateParams,
    ): Promise<Membership> {
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const membership = await tx.membership.create({
                    data: {
                        organizationId: params.organizationId,
                        memberId: params.membershipData.memberId,
                        planId: params.membershipData.planId,
                        startDate: params.membershipData.startDate,
                        endDate: params.membershipData.endDate,
                        pricePaid: params.membershipData.pricePaid,
                        status: params.membershipData.status ?? "ACTIVE",
                    },
                });

                // Activate the member — they now have an active membership
                await tx.member.update({
                    where: { id: params.membershipData.memberId },
                    data: { isActive: true },
                });

                return membership;
            });

            return this.membershipMapper.toDomain(result);
        } catch (error) {
            translatePrismaError(error, "Membresía");
        }
    }

    // ─── Cancel Membership + Deactivate Member ───────────────────
    async cancelMembershipAndDeactivate(
        membershipId: string,
        organizationId: string,
    ): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const membership = await tx.membership.update({
                    where: { id: membershipId, organizationId },
                    data: { status: "CANCELLED" },
                });

                // Check if the member has any OTHER active membership
                const otherActive = await tx.membership.findFirst({
                    where: {
                        memberId: membership.memberId,
                        organizationId,
                        status: "ACTIVE",
                        id: { not: membershipId },
                        deletedAt: null,
                    },
                });

                // Only deactivate if no other active memberships remain
                if (!otherActive) {
                    await tx.member.update({
                        where: { id: membership.memberId },
                        data: { isActive: false },
                    });
                }
            });
        } catch (error) {
            translatePrismaError(error, "Membresía");
        }
    }

    // ─── Soft-Delete Membership + Deactivate Member ──────────────
    async deleteMembershipAndDeactivate(
        membershipId: string,
        organizationId: string,
    ): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const membership = await tx.membership.update({
                    where: { id: membershipId, organizationId },
                    data: {
                        isActive: false,
                        deletedAt: new Date(),
                    },
                });

                // Check if the member has any other active memberships
                const otherActive = await tx.membership.findFirst({
                    where: {
                        memberId: membership.memberId,
                        organizationId,
                        status: "ACTIVE",
                        deletedAt: null,
                    },
                });

                if (!otherActive) {
                    await tx.member.update({
                        where: { id: membership.memberId },
                        data: { isActive: false },
                    });
                }
            });
        } catch (error) {
            translatePrismaError(error, "Membresía");
        }
    }

    // ─── Restore Membership + Re-activate Member ─────────────────
    async restoreMembershipAndActivate(
        membershipId: string,
        organizationId: string,
    ): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                const membership = await tx.membership.update({
                    where: { id: membershipId, organizationId },
                    data: {
                        isActive: true,
                        deletedAt: null,
                    },
                });

                // If the restored membership is ACTIVE, activate the member
                if (membership.status === "ACTIVE") {
                    await tx.member.update({
                        where: { id: membership.memberId },
                        data: { isActive: true },
                    });
                }
            });
        } catch (error) {
            translatePrismaError(error, "Membresía");
        }
    }

    // ─── Stripe Webhook Sync ─────────────────────────────────────────
    async syncStripeSubscriptionEvent(params: SyncStripeSubscriptionEventParams): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                // ─── Resolve Clerk ID → CUID ────────────────────────────
                // The metadata from Stripe may contain a Clerk org ID (org_xxx)
                // but all DB queries expect the internal CUID.
                let resolvedOrgId = params.organizationId;

                if (params.organizationId.startsWith('org_')) {
                    const org = await tx.organization.findUnique({
                        where: { organizationId: params.organizationId },
                        select: { id: true },
                    });

                    if (!org) {
                        console.error(`[Stripe Sync] Organization not found for Clerk ID: ${params.organizationId}`);
                        return;
                    }

                    resolvedOrgId = org.id;
                    console.log(`[Stripe Sync] Resolved Clerk ID ${params.organizationId} → CUID ${resolvedOrgId}`);
                }

                // Upsert subscription
                // Not all organizations will have a subscription created yet
                const existingSub = await tx.subscription.findUnique({
                    where: { organizationId: resolvedOrgId }
                });

                if (existingSub) {
                    // Prevent race conditions: Ignore events from an OLD subscription if we already
                    // have a newer subscription in place. We specifically want to ignore 'deleted'
                    // or 'updated' events from older subscriptions when a new one is active.
                    // However, we MUST accept 'customer.subscription.updated' if it's for the NEW token,
                    // so we only ignore if the incoming event belongs to an older subscription id.
                    if (
                        params.eventType === 'customer.subscription.deleted' &&
                        existingSub.stripeSubscriptionId &&
                        existingSub.stripeSubscriptionId !== params.stripeSubscriptionId
                    ) {
                        return; // Old subscription deleted event, ignore it to protect the new active subscription
                    }

                    await tx.subscription.update({
                        where: { id: existingSub.id },
                        data: {
                            organizationPlanId: params.organizationPlanId,
                            stripeCustomerId: params.stripeCustomerId,
                            stripeSubscriptionId: params.stripeSubscriptionId,
                            status: params.status,
                            pricePaid: params.pricePaid !== undefined ? params.pricePaid : existingSub.pricePaid,
                            currentPeriodStart: params.currentPeriodStart,
                            currentPeriodEnd: params.currentPeriodEnd,
                            cancelAtPeriodEnd: params.cancelAtPeriodEnd,
                        }
                    });
                } else {
                    await tx.subscription.create({
                        data: {
                            organizationId: resolvedOrgId,
                            organizationPlanId: params.organizationPlanId,
                            stripeCustomerId: params.stripeCustomerId,
                            stripeSubscriptionId: params.stripeSubscriptionId,
                            status: params.status,
                            pricePaid: params.pricePaid ?? 0,
                            currentPeriodStart: params.currentPeriodStart,
                            currentPeriodEnd: params.currentPeriodEnd,
                            cancelAtPeriodEnd: params.cancelAtPeriodEnd,
                        }
                    });
                }

                // En la misma transacción, forzamos actualizar la Organización
                const plan = await tx.organizationPlan.findUnique({
                    where: { id: params.organizationPlanId }
                });

                // On deletion, clear the stripeSubscriptionId so the org is clean
                const isCancellation = params.eventType === 'customer.subscription.deleted';

                const orgUpdateData: any = {
                    organizationPlanId: params.organizationPlanId,
                    stripeCustomerId: params.stripeCustomerId,
                    stripeSubscriptionId: isCancellation ? null : params.stripeSubscriptionId,
                };

                if (plan) {
                    orgUpdateData.organizationPlan = plan.name;
                }

                await tx.organization.update({
                    where: { id: resolvedOrgId },
                    data: orgUpdateData,
                });

                // If Trialing, mark Organization as having used its trial
                if (params.status === 'TRIALING') {
                    await tx.organization.update({
                        where: { id: resolvedOrgId },
                        data: {
                            hasUsedTrial: true
                        }
                    });
                }
            });
        } catch (error) {
            console.error(`[Stripe Sync] Raw Prisma error:`, error);
            translatePrismaError(error, "Sincronización Stripe");
        }
    }
}
