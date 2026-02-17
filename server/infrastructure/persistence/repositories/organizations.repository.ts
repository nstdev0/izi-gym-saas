import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { BaseRepository } from "./base.repository";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
} from "@/server/domain/types/organizations";
import { Organization } from "@/server/domain/entities/Organization";
import { OrganizationMapper } from "../mappers/organizations.mapper";

export class OrganizationsRepository
  extends BaseRepository<
    Prisma.OrganizationDelegate,
    Organization,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    OrganizationsFilters
  >
  implements IOrganizationRepository {

  /**
   * Initializes the OrganizationsRepository.
   * @param organizationModel - The Prisma delegate for Organization.
   * @param organizationId - The context organization ID (tenant).
   */

  constructor(
    protected readonly organizationModel: Prisma.OrganizationDelegate,
    protected readonly organizationId?: string
  ) {
    super(organizationModel, new OrganizationMapper(), organizationId)
  }

  async findCurrent(): Promise<Organization | null> {
    if (!this.organizationId) return null;
    const org = await this.organizationModel.findUnique({
      where: { id: this.organizationId },
      include: { config: true, plan: true }
    });

    if (!org) return null;
    return this.mapper.toDomain(org);
  }

  protected async buildPrismaClauses(
    filters: OrganizationsFilters,
  ): Promise<[Prisma.OrganizationWhereInput, Prisma.OrganizationOrderByWithRelationInput]> {
    const whereClause: Prisma.OrganizationWhereInput = {};
    let orderByClause: Prisma.OrganizationOrderByWithRelationInput = { createdAt: "desc" };

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        whereClause.AND = searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { slug: { contains: term, mode: "insensitive" } },
          ],
        }));
      }
    }

    if (filters.status) {
      const status = filters.status.toLowerCase();
      if (status === 'active') whereClause.isActive = true;
      if (status === 'inactive') whereClause.isActive = false;
    }

    if (filters.sort) {
      const [field, direction] = filters.sort.split("-");
      if (direction === "asc" || direction === "desc") {
        if (field === "name") orderByClause = { name: direction };
        if (field === "createdAt") orderByClause = { createdAt: direction };
      }
    }

    return [whereClause, orderByClause];
  }

  // async createWithTransaction(
  //   input: CreateOrganizationInput,
  //   userId: string,
  // ): Promise<Organization> {


  // }

  async upgradePlan(slug: string): Promise<Organization> {
    if (!this.organizationId) throw new Error("Organization Context required");

    // 1. Find the plan
    const plan = await prisma.organizationPlan.findUnique({
      where: { slug },
    });

    if (!plan) {
      throw new Error(`El plan '${slug}' no es válido o no existe.`);
    }

    // 2. Execute transaction
    await prisma.$transaction(async (tx) => {
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
    });

    // 3. Return updated organization
    const updatedOrg = await this.organizationModel.findUnique({
      where: { id: this.organizationId },
      include: {
        config: true,
        plan: true
      }
    });

    if (!updatedOrg) throw new Error("Organization not found after upgrade");

    return this.mapper.toDomain(updatedOrg);
  }

  async updateSettings(id: string, settings: any): Promise<Organization> {
    const { name, image, config } = settings;

    if (name || image !== undefined) {
      await this.organizationModel.update({
        where: { id },
        data: {
          name: name,
          image: image
        }
      });
    }

    if (config) {
      const payload: any = { ...config };

      if (config.identity) {
        if (config.identity.locale) payload.locale = config.identity.locale;
        if (config.identity.timezone) payload.timezone = config.identity.timezone;
        if (config.identity.currency) payload.currency = config.identity.currency;
      }

      await this.organizationModel.update({
        where: { id },
        data: {
          config: {
            upsert: {
              create: payload,
              update: payload
            }
          }
        }
      });
    }

    const updatedOrg = await this.organizationModel.findUnique({
      where: { id },
      include: { config: true, plan: true }
    });

    if (!updatedOrg) throw new Error("Organization not found after update");

    return this.mapper.toDomain(updatedOrg);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const record = await this.organizationModel.findUnique({
      where: { slug },
    });

    return record ? this.mapper.toDomain(record) : null;
  }
}