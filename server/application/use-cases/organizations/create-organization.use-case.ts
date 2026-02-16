import { PrismaClient } from "@/generated/prisma/client";
import { Organization } from "@/server/domain/entities/Organization";
import { BadRequestError, ConflictError, NotFoundError } from "@/server/domain/errors/common";
import { CreateOrganizationInput } from "@/server/domain/types/organizations";
import { OrganizationMapper } from "@/server/infrastructure/persistence/mappers/organizations.mapper";
import { clerkClient } from "@clerk/nextjs/server";

export class CreateOrganizationUseCase {
  constructor(private readonly prisma: PrismaClient, private readonly mapper: OrganizationMapper) { }

  async execute(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization> {
    const selectedPlan = input.planSlug || "free-trial";

    // 1. Buscar Plan
    const plan = await this.prisma.organizationPlan.findUnique({
      where: { slug: selectedPlan },
    });

    if (!plan) {
      throw new NotFoundError(`El plan '${selectedPlan}' no es válido o no existe.`);
    }

    // 2. Verificar Slug
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: input.slug },
    });
    if (existingOrg) {
      throw new ConflictError("Este URL ya está en uso");
    }

    // 3. Transacción
    const newOrg = await this.prisma.$transaction(async (tx) => {
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
              },

              branding: {
                primary_color: null,
                secondary_color: null,
                font_family: null,
                logo_url: null,
                favicon_url: null,
                custom_css_enabled: false,
                app_name_override: null
              },

              billing: {
                tax_settings: { enabled: true, tax_name: "IGV", tax_rate: 0.18, prices_include_tax: true },
                payment_gateways: { stripe: { enabled: true, publishable_key: null, methods: [] }, paypal: { enabled: false }, cash: { enabled: true, require_manager_approval: false } },
                dunning_management: { retry_attempts: 3, retry_interval_days: 2, lock_access_on_fail: true, notify_customer: true },
                proration_behavior: "always_invoice"
              },

              booking: {
                booking_window_days: 7,
                cancellation_policy: { late_cancel_window_hours: null, penalty_fee: null, refund_credits: null },
                waitlist: { enabled: true, auto_promote: true, max_size: 5 },
                max_active_bookings: 3,
                guest_passes_allowed: true
              },

              accessControl: {
                provider: null,
                hardware_integration_enabled: false,
                check_in_method: ["qr", "manual"],
                allow_entry_grace_period_minutes: null,
                anti_passback: true,
                multi_location_access: false
              },

              notifications: {
                channels: { email: false, sms: false, push: false, whatsapp: false },
                triggers: {
                  booking_confirmation: { enabled: true, channel: "push" },
                  payment_failed: { enabled: true, channel: "email" },
                  birthday_greeting: { enabled: true, channel: "sms" },
                  membership_expiring: { enabled: true, days_before: 5 }
                },
                marketing_consent_required: null
              },

              features: {
                gamification: { leaderboards: false, achievements: false, social_feed: false },
                workouts: { track_weights: false, video_library: false },
                ecommerce: { sell_products: false, click_and_collect: false }
              },

              staffSettings: {
                require_2fa: false,
                trainers_can_view_revenue: false,
                trainers_can_cancel_classes: false,
                reception_can_apply_discounts: false,
                max_discount_percent: null
              }
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

        if (!email) throw new BadRequestError("Usuario no registrado en Clerk");

        await tx.user.create({
          data: {
            id: userId,
            email: email,
            image: clerkUser.imageUrl,
            role: "OWNER",
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

    return this.mapper.toDomain(newOrg);

  }

}

export type ICreateOrganizationUseCase = InstanceType<typeof CreateOrganizationUseCase>;