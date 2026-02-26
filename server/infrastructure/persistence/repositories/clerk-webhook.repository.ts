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
        const existingUser = await this.prisma.user.findUnique({
            where: { email: input.email }
        });

        if (existingUser) {
            await this.prisma.user.update({
                where: { email: input.email },
                data: {
                    id: input.id,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    image: input.image,
                    isActive: true
                }
            });
            console.log(`👤 Usuario actualizado (resolución por email): ${input.email}`);
        } else {
            await this.prisma.user.create({
                data: {
                    id: input.id,
                    email: input.email,
                    firstName: input.firstName,
                    lastName: input.lastName,
                    image: input.image,
                    isActive: true,
                    preferences: {
                        theme: "system",
                        notifications: { email: true, push: false },
                        language: "es"
                    }
                }
            });
            console.log(`👤 Usuario creado nuevo: ${input.email}`);
        }
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

    private async generateUniqueSlug(baseSlug: string): Promise<string> {
        let currentSlug = baseSlug;
        let counter = 2;
        while (true) {
            const exists = await this.prisma.organization.findUnique({ where: { slug: currentSlug } });
            if (!exists) return currentSlug;
            currentSlug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    async syncOrganization(input: SyncOrganizationInput, freePlanId: string, freePlanName: string, freePlanPrice: number): Promise<void> {
        let cleanSlug = input.slug;
        if (!cleanSlug) {
            const baseSlug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '');
            cleanSlug = await this.generateUniqueSlug(baseSlug);
        }

        await this.prisma.$transaction(async (tx) => {
            const existingOrg = await tx.organization.findUnique({
                where: { id: input.id }
            });

            if (existingOrg) {
                await tx.organization.update({
                    where: { id: input.id },
                    data: {
                        name: input.name,
                        slug: cleanSlug,
                        image: input.image,
                    }
                });
            } else {
                await tx.organization.create({
                    data: {
                        id: input.id,
                        organizationId: input.id,
                        name: input.name,
                        slug: cleanSlug,
                        image: input.image,
                        organizationPlanId: freePlanId,
                        organizationPlan: freePlanName,
                    },
                });

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
        const userExists = await this.prisma.user.findUnique({ where: { id: input.userId } });
        const orgExists = await this.prisma.organization.findUnique({ where: { id: input.organization.id } });

        if (!userExists || !orgExists) {
            throw new Error(`[Sincronización Asíncrona] Usuario o Organización faltante. userId: ${input.userId}, orgId: ${input.organization.id}. Reintentando evento...`);
        }

        // 2. Extraemos el rol desde Clerk, mapenado los valores de Clerk a nuestros enums
        let parsedRole: Role = Role.STAFF;
        if (input.role === "org:admin") parsedRole = Role.ADMIN;
        if (input.role === "org:owner") parsedRole = Role.OWNER;

        // 3. Upsert en la tabla Pivot (OrganizationMembership)
        await this.prisma.organizationMembership.upsert({
            where: {
                userId_organizationId: {
                    userId: input.userId,
                    organizationId: input.organization.id
                }
            },
            create: {
                userId: input.userId,
                organizationId: input.organization.id,
                role: parsedRole,
                isActive: true
            },
            update: {
                role: parsedRole,
                isActive: true
            }
        });

        console.log(`🔗 Membresía vinculada: ${input.email} -> ${input.organization.name} [Rol: ${parsedRole}]`);
    }

    async removeMembership(userId: string, organizationId: string): Promise<void> {
        try {
            await this.prisma.organizationMembership.update({
                where: {
                    userId_organizationId: { userId, organizationId }
                },
                data: { isActive: false }
            });
            console.log(`❌ Membresía desactivada: ${userId} de ${organizationId}`);
        } catch (error: any) {
            if (error?.code !== 'P2025') throw error;
        }
    }
}