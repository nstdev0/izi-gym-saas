import { Prisma } from "@/generated/prisma/client";
import { BaseRepository } from "./base.repository";
import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  OrganizationsFilters,
} from "@/server/domain/types/organizations";
import { EntityStatus } from "@/server/domain/entities/_base";
import { Organization } from "@/server/domain/entities/Organization";

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
   * Override findUnique to verify organizationId context usage.
   * However, for "get current organization", we often just want findById(this.organizationId).
   */
  async findCurrent(): Promise<Organization | null> {
    if (!this.organizationId) return null;

    const org = await this.model.findUnique({
      where: { id: this.organizationId },
    });

    return org as unknown as Organization | null;
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
      const isValidDirection = direction === "asc" || direction === "desc";
      if (isValidDirection) {
        if (field === "name") orderByClause = { name: direction as Prisma.SortOrder };
        if (field === "createdAt") orderByClause = { createdAt: direction as Prisma.SortOrder };
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

    const selectedPlan = input.planSlug || "free-trial";

    // 1. Buscar Plan (Ahora dinámico)
    const plan = await prisma.organizationPlan.findUnique({
      where: { slug: selectedPlan },
    });

    if (!plan) {
      throw new Error(`El plan '${selectedPlan}' no es válido o no existe.`);
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
          organizationId: "",
          name: input.name,
          slug: input.slug,
          organizationPlanId: plan.id,
          organizationPlan: plan.name,
          config: {
            create: {
              // 1. IDENTIDAD (Casteo a any para evitar error InputJsonValue)
              identity: {
                website: null, // Usa null en vez de undefined para DB
                contact_email: null,
                locale: "es-PE",
                timezone: "America/Lima",
                currency: "PEN",
              } as any,

              // 2. BRANDING
              branding: {
                primary_color: null,
                secondary_color: null,
                font_family: null,
                logo_url: null,
                favicon_url: null,
                custom_css_enabled: false,
                app_name_override: null
              } as any,

              // 3. FACTURACIÓN
              billing: {
                tax_settings: {
                  enabled: true,
                  tax_name: "IGV",
                  tax_rate: 0.18,
                  prices_include_tax: true
                },
                payment_gateways: {
                  stripe: { enabled: true, publishable_key: null, methods: [] },
                  paypal: { enabled: false },
                  cash: { enabled: true, require_manager_approval: false }
                },
                dunning_management: {
                  retry_attempts: 3,
                  retry_interval_days: 2,
                  lock_access_on_fail: true,
                  notify_customer: true
                },
                proration_behavior: "always_invoice"
              } as any,

              // 4. BOOKING
              booking: {
                booking_window_days: 7,
                cancellation_policy: {
                  late_cancel_window_hours: null,
                  penalty_fee: null,
                  refund_credits: null
                },
                waitlist: { enabled: true, auto_promote: true, max_size: 5 },
                max_active_bookings: 3,
                guest_passes_allowed: true
              } as any,

              // 5. CONTROL DE ACCESO
              accessControl: {
                provider: null,
                hardware_integration_enabled: false,
                check_in_method: ["qr", "manual"],
                allow_entry_grace_period_minutes: null,
                anti_passback: true,
                multi_location_access: false
              } as any,

              // 6. NOTIFICACIONES
              notifications: {
                channels: { email: false, sms: false, push: false, whatsapp: false },
                triggers: {
                  booking_confirmation: { enabled: true, channel: "push" },
                  payment_failed: { enabled: true, channel: "email" },
                  birthday_greeting: { enabled: true, channel: "sms" },
                  membership_expiring: { enabled: true, days_before: 5 }
                },
                marketing_consent_required: null
              } as any,

              // 7. FEATURES
              features: {
                gamification: { leaderboards: false, achievements: false, social_feed: false },
                workouts: { track_weights: false, video_library: false },
                ecommerce: { sell_products: false, click_and_collect: false }
              } as any,

              // 8. STAFF
              staffSettings: {
                require_2fa: false,
                trainers_can_view_revenue: false,
                trainers_can_cancel_classes: false,
                reception_can_apply_discounts: false,
                max_discount_percent: null
              } as any
            }
          }
        },
        include: {
          config: true,
        }
      });

      await tx.organization.update({
        where: { id: org.id },
        data: {
          organizationId: org.id,
        }
      })

      // B. Crear Suscripción Trial
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          organizationPlanId: plan.id,
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
    const status = newOrg.isActive ? EntityStatus.ACTIVE : EntityStatus.INACTIVE;

    const domainConfig = newOrg.config ? {
      id: newOrg.config.id,
      locale: (newOrg.config.identity as any)?.locale || "es-PE",
      timezone: (newOrg.config.identity as any)?.timezone || "America/Lima",
      currency: (newOrg.config.identity as any)?.currency || "PEN",

      identity: newOrg.config.identity as Record<string, unknown>,
      branding: newOrg.config.branding as Record<string, unknown>,
      billing: newOrg.config.billing as Record<string, unknown>,
      booking: newOrg.config.booking as Record<string, unknown>,
      accessControl: newOrg.config.accessControl as Record<string, unknown>,
      notifications: newOrg.config.notifications as Record<string, unknown>,
      features: newOrg.config.features as Record<string, unknown>,
      staffSettings: newOrg.config.staffSettings as Record<string, unknown>,
    } : undefined;

    return new Organization(
      newOrg.id,
      newOrg.id,
      newOrg.createdAt,
      newOrg.updatedAt,
      status,
      null,
      newOrg.name,
      newOrg.slug,
      newOrg.isActive,
      newOrg.organizationPlan,
      newOrg.image ? newOrg.image : undefined,
      domainConfig,
      newOrg.organizationPlanId
    );
  }

  async upgradePlan(planSlug: string): Promise<Organization> {
    const { prisma } = await import("@/server/infrastructure/persistence/prisma");

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
        organizationPlan: plan.name,
      },
    });

    return org as Organization;
  }
}
