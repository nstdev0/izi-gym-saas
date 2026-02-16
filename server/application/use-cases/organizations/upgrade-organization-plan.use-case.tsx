import { Organization } from "@/server/domain/entities/Organization";
import { PrismaClient } from "@/generated/prisma/client";
import { OrganizationMapper } from "@/server/infrastructure/persistence/mappers/organizations.mapper";

export class UpgradeOrganizationPlanUseCase {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly mapper: OrganizationMapper,
        private readonly organizationId: string
    ) { }

    async execute(input: string): Promise<Organization> {
        const plan = await this.prisma.organizationPlan.findUnique({
            where: { slug: input },
        });

        if (!plan) {
            throw new Error(`El plan '${input}' no es válido o no existe.`);
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.organization.update({
                where: { id: this.organizationId },
                data: {
                    organizationPlanId: plan.id,
                    organizationPlan: plan.name
                }
            });

            await tx.subscription.update({
                where: { organizationId: this.organizationId },
                data: {
                    pricePaid: plan.price
                },
            });

        })

        const org = await this.prisma.organization.update({
            where: { id: this.organizationId },
            data: {
                organizationPlanId: plan.id,
                organizationPlan: plan.name
            },
            include: {
                config: true,
                plan: true
            }
        });

        return this.mapper.toDomain(org);
    }
}

export type IUpgradeOrganizationPlanUseCase = InstanceType<typeof UpgradeOrganizationPlanUseCase>