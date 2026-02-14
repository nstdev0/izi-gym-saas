import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/server/infrastructure/persistence/prisma"; // Import directo es mejor aquí
import { BaseRepository } from "./base.repository";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
} from "@/server/domain/types/organizations";
import { EntityStatus } from "@/server/domain/entities/_base";
import { Organization } from "@/server/domain/entities/Organization";
import { clerkClient } from "@clerk/nextjs/server";

export class OrganizationsRepository
  extends BaseRepository<
    Prisma.OrganizationDelegate,
    Organization,
    CreateOrganizationInput,
    UpdateOrganizationInput,
    OrganizationsFilters
  >
  implements IOrganizationRepository {

  async findCurrent(): Promise<Organization | null> {
    if (!this.organizationId) return null;
    // Usamos findUnique del modelo base, pero mapeamos correctamente si es necesario
    const org = await this.model.findUnique({
      where: { id: this.organizationId },
      include: { config: true, plan: true } // Incluir relaciones necesarias
    });

    if (!org) return null;
    return this.mapToEntity(org);
  }

  async buildPrismaClauses(
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

  async createWithTransaction(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization> {
    const selectedPlan = input.planSlug || "free-trial";

    // 1. Buscar Plan
    const plan = await prisma.organizationPlan.findUnique({
      where: { slug: selectedPlan },
    });

    if (!plan) {
      throw new Error(`El plan '${selectedPlan}' no es válido o no existe.`);
    }

    // 2. Verificar Slug
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: input.slug },
    });
    if (existingOrg) {
      throw new Error("Este URL ya está en uso");
    }

    // 3. Transacción
    const newOrg = await prisma.$transaction(async (tx) => {
      // A. Crear Org
      const org = await tx.organization.create({
        data: {
          organizationId: "",
          name: input.name,
          slug: input.slug,
          organizationPlanId: plan.id,
          organizationPlan: plan.name,
          config: {
            create: {
              identity: {
                website: null,
                contact_email: null,
                locale: "es-PE",
                timezone: "America/Lima",
                currency: "PEN",
              } as Prisma.InputJsonValue,

              branding: {
                primary_color: null,
                secondary_color: null,
                font_family: null,
                logo_url: null,
                favicon_url: null,
                custom_css_enabled: false,
                app_name_override: null
              } as Prisma.InputJsonValue,

              billing: {
                tax_settings: { enabled: true, tax_name: "IGV", tax_rate: 0.18, prices_include_tax: true },
                payment_gateways: { stripe: { enabled: true, publishable_key: null, methods: [] }, paypal: { enabled: false }, cash: { enabled: true, require_manager_approval: false } },
                dunning_management: { retry_attempts: 3, retry_interval_days: 2, lock_access_on_fail: true, notify_customer: true },
                proration_behavior: "always_invoice"
              } as Prisma.InputJsonValue,

              booking: {
                booking_window_days: 7,
                cancellation_policy: { late_cancel_window_hours: null, penalty_fee: null, refund_credits: null },
                waitlist: { enabled: true, auto_promote: true, max_size: 5 },
                max_active_bookings: 3,
                guest_passes_allowed: true
              } as Prisma.InputJsonValue,

              accessControl: {
                provider: null,
                hardware_integration_enabled: false,
                check_in_method: ["qr", "manual"],
                allow_entry_grace_period_minutes: null,
                anti_passback: true,
                multi_location_access: false
              } as Prisma.InputJsonValue,

              notifications: {
                channels: { email: false, sms: false, push: false, whatsapp: false },
                triggers: {
                  booking_confirmation: { enabled: true, channel: "push" },
                  payment_failed: { enabled: true, channel: "email" },
                  birthday_greeting: { enabled: true, channel: "sms" },
                  membership_expiring: { enabled: true, days_before: 5 }
                },
                marketing_consent_required: null
              } as Prisma.InputJsonValue,

              features: {
                gamification: { leaderboards: false, achievements: false, social_feed: false },
                workouts: { track_weights: false, video_library: false },
                ecommerce: { sell_products: false, click_and_collect: false }
              } as Prisma.InputJsonValue,

              staffSettings: {
                require_2fa: false,
                trainers_can_view_revenue: false,
                trainers_can_cancel_classes: false,
                reception_can_apply_discounts: false,
                max_discount_percent: null
              } as Prisma.InputJsonValue
            }
          }
        },
        include: {
          config: true,
          plan: true
        }
      });

      // Update organizationId to self (Tenant Root)
      // Solo si tu modelo lo requiere explícitamente, si no, es redundante.
      await tx.organization.update({
        where: { id: org.id },
        data: { organizationId: org.id } // Asumiendo que tienes este campo
      });

      // B. Suscripción
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          organizationPlanId: plan.id,
          status: "TRIALING",
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          pricePaid: plan.price
        },
      });

      // C. Usuario (Dueño)
      const existingUser = await tx.user.findUnique({ where: { id: userId } });

      if (!existingUser) {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) throw new Error("User has no email in Clerk");

        await tx.user.create({
          data: {
            id: userId,
            email: email,
            // image: clerkUser.imageUrl, // Verifica si tu modelo User tiene 'image'
            role: "OWNER", // Usa el Enum Role.OWNER si es posible
            // passwordHash: "OAUTH_MANAGED", // Verifica si existe
            organizationId: org.id,
            isActive: true
          }
        });
      } else {
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

    return this.mapToEntity(newOrg);
  }

  async upgradePlan(planSlug: string): Promise<Organization> {
    const plan = await prisma.organizationPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan) {
      throw new Error(`El plan '${planSlug}' no es válido o no existe.`);
    }

    const org = await this.model.update({
      where: { id: this.organizationId },
      data: {
        organizationPlanId: plan.id,
        // organizationPlan: plan.name, // ELIMINAR: Esto da error en Prisma update
      },
      include: {
        config: true,
        plan: true
      }
    });

    return this.mapToEntity(org);
  }

  private mapToEntity(prismaOrg: any): Organization {
    const status = prismaOrg.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE;

    // Mapeo seguro de Config
    // Si tienes una clase OrganizationConfig, instánciala aquí.
    // Si no, asegúrate de que Organization acepte el objeto plano casteado.
    const configData = prismaOrg.config ? {
      id: prismaOrg.config.id,
      identity: prismaOrg.config.identity,
      branding: prismaOrg.config.branding,
      billing: prismaOrg.config.billing,
      booking: prismaOrg.config.booking,
      accessControl: prismaOrg.config.accessControl,
      notifications: prismaOrg.config.notifications,
      features: prismaOrg.config.features,
      staffSettings: prismaOrg.config.staffSettings,
    } : undefined;

    return new Organization(
      prismaOrg.id,
      prismaOrg.id, // organizationId
      prismaOrg.createdAt,
      prismaOrg.updatedAt,
      status,
      prismaOrg.deletedAt,
      prismaOrg.name,
      prismaOrg.slug,
      prismaOrg.isActive,
      // Mapea el Plan si vino incluido
      prismaOrg.organizationPlan ? { ...prismaOrg.organizationPlan } as any : undefined,
      prismaOrg.image || undefined,
      configData as any, // Cast a OrganizationConfig
      prismaOrg.organizationPlanId
    );
  }
}