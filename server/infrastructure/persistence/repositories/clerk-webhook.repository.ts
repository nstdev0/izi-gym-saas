import { PrismaClient, Role } from "@/generated/prisma/client";
import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";
import { SyncUserInput, SyncOrganizationInput, SyncMembershipInput } from "@/server/domain/types/clerk-webhook";

export class ClerkWebhookRepository implements IClerkWebhookRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async getFreePlan(): Promise<{ id: string; name: string; price: number }> {
        let freePlan = await this.prisma.organizationPlan.findUnique({
            where: { slug: "free-trial" },
        });
        if (!freePlan) {
            freePlan = await this.prisma.organizationPlan.create({
                data: {
                    name: "Free trial",
                    slug: "free-trial",
                    price: 0,
                    limits: { members: 100 },
                    description: "Free trial with no credit card required",
                }
            });
            console.log("🛠️ Plan 'free-trial' creado automáticamente.");
        }
        return { id: freePlan.id, name: freePlan.name, price: Number(freePlan.price) };
    }

    async syncUser(input: SyncUserInput): Promise<void> {
        if (input.email) {
            const existingUser = await this.prisma.user.findFirst({
                where: { email: input.email },
            });

            if (existingUser && existingUser.id !== input.id) {
                console.log(`🧟 Zombie detectado (User): ${input.email}. Desactivando en lugar de eliminar...`);
                try {
                    await this.prisma.user.update({
                        where: { id: existingUser.id },
                        data: { email: `borrado_${existingUser.id}@zombie.local`, isActive: false }
                    });
                } catch (e) {
                    console.log(`No se pudo desactivar el zombie: ${e}`);
                }
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
                role: Role.STAFF,
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
            console.log(`🗑️ Usuario eliminado: ${id}`);
        } catch (error: any) {
            if (error?.code === 'P2003') {
                console.log(`⚠️ Usuario ${id} tiene relaciones activas, procediendo a desactivarlo en lugar de eliminar.`);
                await this.prisma.user.update({
                    where: { id },
                    data: { isActive: false, email: `borrado_${id}@zombie.local` }
                });
            } else if (error?.code !== 'P2025') {
                throw error;
            }
        }
    }

    async syncOrganization(input: SyncOrganizationInput, freePlanId: string, freePlanName: string, freePlanPrice: number): Promise<void> {
        // 🟢 FIX: Confiamos 100% en el slug de Clerk. 
        // Solo si no viene, generamos uno limpio quitando tildes y caracteres especiales.
        const cleanSlug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '');

        await this.prisma.$transaction(async (tx) => {
            await tx.organization.upsert({
                where: { id: input.id },
                update: {
                    name: input.name,
                    slug: cleanSlug, // Actualizamos con el slug de Clerk
                    image: input.image,
                },
                create: {
                    id: input.id,
                    organizationId: input.id,
                    name: input.name,
                    slug: cleanSlug,
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
        console.log(`✅ Organización procesada: ${input.name} (Slug: ${cleanSlug})`);
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
                console.log(`🧟 Zombie detectado (Membership): ${input.email}. Desactivando...`);
                try {
                    await this.prisma.user.update({
                        where: { id: existingUser.id },
                        data: { email: `borrado_${existingUser.id}@zombie.local`, isActive: false }
                    });
                } catch (e) {
                    console.log(`No se pudo desactivar el zombie en membresía: ${e}`);
                }
            }
        }

        const orgCleanSlug = input.organization.slug || input.organization.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '');

        await this.prisma.user.upsert({
            where: { id: input.userId },
            create: {
                id: input.userId,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                image: input.image,
                role: Role.OWNER,
                isActive: true,
                organization: {
                    connectOrCreate: {
                        where: { id: input.organization.id },
                        create: {
                            id: input.organization.id,
                            organizationId: input.organization.id,
                            name: input.organization.name,
                            slug: orgCleanSlug,
                            image: input.organization.image,
                            organizationPlanId: freePlanId,
                            organizationPlan: freePlanName,
                        }
                    }
                }
            },
            update: {
                role: Role.OWNER,
                isActive: true,
                organization: {
                    connectOrCreate: {
                        where: { id: input.organization.id },
                        create: {
                            id: input.organization.id,
                            organizationId: input.organization.id,
                            name: input.organization.name,
                            slug: orgCleanSlug,
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