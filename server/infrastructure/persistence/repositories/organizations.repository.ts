import { Prisma } from "@/generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { Organization } from "@/server/domain/entities/Organization";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
} from "@/server/domain/types/organizations";

export class OrganizationsRepository
  extends BaseRepository<
    Prisma.OrganizationDelegate,
    Organization,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    OrganizationsFilters
  >
  implements IOrganizationRepository
{
  async buildQueryFilters(
    filters: OrganizationsFilters,
  ): Promise<Prisma.OrganizationWhereInput> {
    const whereClause: Prisma.OrganizationWhereInput = {};

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        whereClause.AND = searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }));
      }
    }
    return whereClause;
  }

  async createWithTransaction(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization> {
    const { prisma } =
      await import("@/server/infrastructure/persistence/prisma");

    // 1. Buscar Plan Base (Free Trial)
    const freePlan = await prisma.organizationPlan.findUnique({
      where: { slug: "free-trial" },
    });

    if (!freePlan) {
      throw new Error("El plan gratuito no está configurado (run seed)");
    }

    // 2. Verificar Slug Duplicado
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: input.slug },
    });
    if (existingOrg) {
      throw new Error("Este URL ya está en uso");
    }

    // 3. Transacción Atómica
    const newOrg = await prisma.$transaction(async (tx) => {
      // A. Crear Org
      const org = await tx.organization.create({
        data: {
          name: input.name,
          slug: input.slug,
          organizationPlanId: freePlan.id,
        },
      });

      // B. Crear Suscripción Trial
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          organizationPlanId: freePlan.id,
          status: "TRIALING",
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
        },
      });

      // C. Vincular Usuario como Dueño
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: org.id,
          role: "OWNER",
        },
      });

      return org;
    });

    // NOTE: Organization entity expects: id, organizationId, createdAt, updatedAt, name, slug, isActive.
    // However, Organization model in Prisma doesn't always strictly map to "organizationId" property of itself unless it's a tenant data.
    // The BaseEntity expects organizationId, but Organization is the tenant itself.
    // We might need to adjust the Entity or pass the ID as organizationId too.
    return new Organization(
      newOrg.id,
      newOrg.id, // organizationId (is itself)
      newOrg.createdAt,
      newOrg.updatedAt,
      newOrg.name,
      newOrg.slug,
      newOrg.isActive,
    );
  }
}
