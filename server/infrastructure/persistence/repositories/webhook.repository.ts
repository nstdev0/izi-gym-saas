import { PrismaClient, Role } from "@/generated/prisma/client";
import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";
import { SyncUserInput, SyncOrganizationInput, SyncMembershipInput } from "@/server/domain/types/clerk-webhook";

export class WebhookRepository implements IClerkWebhookRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async getFreePlan(): Promise<{ id: string; name: string; price: number }> {
        const freePlan = await this.prisma.organizationPlan.findUnique({
            where: { slug: "free-trial" },
        });
        if (!freePlan) throw new Error("CRÍTICO: Plan 'free-trial' no encontrado.");
        return { id: freePlan.id, name: freePlan.name, price: Number(freePlan.price) };
    }

    async syncUser(input: SyncUserInput): Promise<void> {
        if (input.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: { email: input.email },
            });

            if (existingUser && existingUser.id !== input.id) {
                console.log(`🧟 Zombie detectado: ${input.email}. Eliminando...`);
                await this.prisma.user.delete({ where: { id: existingUser.id } });
            }
        }

        await this.prisma.user.upsert({
            where: { id: input.id },
            create: {
                id: input.id,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                image: input.image,
                role: Role.STAFF, // Default base role
                isActive: true,
            },
            update: {
                email: input.email || undefined,
                firstName: input.firstName,
                lastName: input.lastName,
                image: input.image,
            }
        });
        console.log(`👤 Usuario procesado: ${input.email}`);
    }

    async deleteUser(id: string): Promise<void> {
        try {
            await this.prisma.user.delete({ where: { id } });
        } catch (error: any) {
            if (error?.code !== 'P2025') throw error; // Ignore "Record to delete does not exist"
        }
    }

    async syncOrganization(input: SyncOrganizationInput, freePlanId: string, freePlanName: string, freePlanPrice: number): Promise<void> {
        // 🟢 FIX 1: SLUG SEGURO
        const safeSlug = input.slug || `${input.name.toLowerCase().replace(/\s+/g, "-")}-${input.id.slice(-4)}`;

        await this.prisma.$transaction(async (tx) => {
            await tx.organization.upsert({
                where: { id: input.id },
                update: {
                    name: input.name,
                    slug: input.slug || undefined,
                    image: input.image,
                },
                create: {
                    id: input.id,
                    organizationId: input.id,
                    name: input.name,
                    slug: safeSlug,
                    image: input.image,
                    organizationPlanId: freePlanId,
                    organizationPlan: freePlanName,
                },
            });

            const sub = await tx.subscription.findUnique({
                where: { organizationId: input.id }
            });

            if (!sub) {
                await tx.subscription.create({
                    data: {
                        organizationId: input.id,
                        organizationPlanId: freePlanId,
                        status: "TRIALING",
                        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        pricePaid: freePlanPrice
                    },
                });
            }
        });
        console.log(`✅ Organización procesada: ${input.name}`);
    }

    async deleteOrganization(id: string): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            await tx.subscription.deleteMany({ where: { organizationId: id } });
            try {
                await tx.organization.delete({ where: { id } });
                console.log(`🗑️ Organización eliminada: ${id}`);
            } catch (error: any) {
                if (error?.code !== 'P2025') throw error;
            }
        });
    }

    async syncMembership(input: SyncMembershipInput, freePlanId: string, freePlanName: string): Promise<void> {
        if (input.email) {
            const existingUser = await this.prisma.user.findFirst({ where: { email: input.email } });
            if (existingUser && existingUser.id !== input.userId) {
                await this.prisma.user.delete({ where: { id: existingUser.id } });
            }
        }

        let appRole: Role = Role.STAFF;
        if (input.role === "org:admin") appRole = Role.ADMIN;

        // 🟢 FIX 1: SLUG SEGURO AQUÍ TAMBIÉN
        const orgNameSlug = input.organization.name.toLowerCase().replace(/\s+/g, "-");
        const orgSafeSlug = input.organization.slug || `${orgNameSlug}-${input.organization.id.slice(-4)}`;

        await this.prisma.user.upsert({
            where: { id: input.userId },
            create: {
                id: input.userId,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                image: input.image,
                role: appRole,
                isActive: true,
                organization: {
                    connectOrCreate: {
                        where: { id: input.organization.id },
                        create: {
                            id: input.organization.id,
                            organizationId: input.organization.id,
                            name: input.organization.name,
                            slug: orgSafeSlug,
                            image: input.organization.image,
                            organizationPlanId: freePlanId,
                            organizationPlan: freePlanName,
                        }
                    }
                }
            },
            update: {
                role: appRole,
                isActive: true,
                organization: {
                    connectOrCreate: {
                        where: { id: input.organization.id },
                        create: {
                            id: input.organization.id,
                            organizationId: input.organization.id,
                            name: input.organization.name,
                            slug: orgSafeSlug,
                            image: input.organization.image,
                            organizationPlanId: freePlanId,
                            organizationPlan: freePlanName,
                        }
                    }
                }
            }
        });
        console.log(`🔗 Membresía vinculada: ${input.email} -> ${input.organization.name}`);
    }

    async removeMembership(userId: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: { organizationId: null, isActive: false }
            });
        } catch (error: any) {
            if (error?.code !== 'P2025') throw error;
        }
    }
}
