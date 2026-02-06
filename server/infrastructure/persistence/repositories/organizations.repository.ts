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
  implements IOrganizationRepository {
  async buildPrismaClauses(
    filters: OrganizationsFilters,
  ): Promise<[Prisma.OrganizationWhereInput, Prisma.OrganizationOrderByWithRelationInput]> {
    const whereClause: Prisma.OrganizationWhereInput = {};
    const orderByClause: Prisma.OrganizationOrderByWithRelationInput = { createdAt: "desc" };

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

      if (searchTerms.length > 0) {
        whereClause.AND = searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            // Organization doesn't have email in schema directly usually, but if it does:
            // { email: { contains: term, mode: "insensitive" } }, 
          ],
        }));
      }
    }
    return [whereClause, orderByClause];
  }

  async createWithTransaction(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization> {
    const { prisma } =
      await import("@/server/infrastructure/persistence/prisma");

    // 1. Buscar Plan (Ahora dinámico)
    const planSlug = input.planSlug || "free-trial"; // Default fallback
    const selectedPlan = await prisma.organizationPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!selectedPlan) {
      throw new Error(`El plan '${planSlug}' no es válido o no existe.`);
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
          organizationPlanId: selectedPlan.id,
        },
      });

      // B. Crear Suscripción Trial
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          organizationPlanId: selectedPlan.id,
          status: "TRIALING",
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
        },
      });

      // C. Verificar si el usuario existe en DB (JIT Sync)
      // Esto previene condiciones de carrera si el Webhook de Clerk es lento
      const existingUser = await tx.user.findUnique({ where: { id: userId } });

      if (!existingUser) {
        // Fetch from Clerk API (Server Side)
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email) throw new Error("User has no email in Clerk");

        // Create User in DB
        await tx.user.create({
          data: {
            id: userId,
            email: email,
            image: clerkUser.imageUrl,
            role: "OWNER",
            passwordHash: "OAUTH_MANAGED",
            organizationId: org.id,
          }
        });
      } else {
        // Vincular Usuario como Dueño (Update)
        await tx.user.update({
          where: { id: userId },
          data: {
            organizationId: org.id,
            role: "OWNER",
          },
        });
      }

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
