import { BaseEntity } from "./common.types";
import { z } from "zod";

// TODO: Mirror OrganizationConfig and OrganizationPlan if needed more explicitly
export interface Organization extends BaseEntity {
    name: string;
    slug: string;
    isActive: boolean;
    organizationPlan: string;
    image?: string;
    config?: any | null; // Using any for config to avoid complex nested types for now, or define if needed
    organizationPlanId?: string;
    plan?: any;
}

export const createOrganizationSchema = z.object({
    name: z.string().min(3),
    slug: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/),
    planSlug: z.string().optional(),
});

// Helper schemas for complex objects
const TaxSettingsSchema = z.object({
    enabled: z.boolean().default(true),
    tax_name: z.string().default("IGV"),
    tax_rate: z.number().default(0.18),
    prices_include_tax: z.boolean().default(true),
});

const PaymentGatewaysSchema = z.object({
    stripe: z.object({
        enabled: z.boolean().default(false),
        publishable_key: z.string().nullable().optional(),
        methods: z.array(z.string()).default([]),
    }).optional(),
    paypal: z.object({ enabled: z.boolean().default(false) }).optional(),
    cash: z.object({
        enabled: z.boolean().default(true),
        require_manager_approval: z.boolean().default(false),
    }).optional(),
});

const DunningManagementSchema = z.object({
    retry_attempts: z.number().default(3),
    retry_interval_days: z.number().default(2),
    lock_access_on_fail: z.boolean().default(true),
    notify_customer: z.boolean().default(true),
});

export const UpdateOrganizationSettingsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    image: z.string().optional(),

    // New Config Structure
    config: z.object({
        identity: z.object({
            website: z.string().nullable().optional(),
            contact_email: z.string().email().nullable().optional(),
            locale: z.string().default("es-PE"),
            timezone: z.string().default("America/Lima"),
            currency: z.string().default("PEN"),
        }).optional(),

        branding: z.object({
            secondary_color: z.string().nullable().optional(),
            font_family: z.string().nullable().optional(),
            logo_url: z.string().nullable().optional(),
            favicon_url: z.string().nullable().optional(),
            custom_css_enabled: z.boolean().default(false),
            app_name_override: z.string().nullable().optional(),
        }).optional(),

        billing: z.object({
            tax_settings: TaxSettingsSchema.optional(),
            payment_gateways: PaymentGatewaysSchema.optional(),
            dunning_management: DunningManagementSchema.optional(),
            proration_behavior: z.enum(["always_invoice", "create_prorations"]).default("always_invoice"),
        }).optional(),

        booking: z.object({
            booking_window_days: z.number().default(7),
            cancellation_policy: z.object({
                late_cancel_window_hours: z.number().nullable().optional(),
                penalty_fee: z.number().nullable().optional(),
                refund_credits: z.boolean().nullable().optional(),
            }).optional(),
            waitlist: z.object({
                enabled: z.boolean().default(true),
                auto_promote: z.boolean().default(true),
                max_size: z.number().default(5),
            }).optional(),
            max_active_bookings: z.number().default(3),
            guest_passes_allowed: z.boolean().default(true),
        }).optional(),

        accessControl: z.object({
            provider: z.string().nullable().optional(),
            hardware_integration_enabled: z.boolean().default(false),
            check_in_method: z.array(z.string()).default(["qr", "manual"]),
            allow_entry_grace_period_minutes: z.number().nullable().optional(),
            anti_passback: z.boolean().default(true),
            multi_location_access: z.boolean().default(false),
        }).optional(),

        notifications: z.object({
            channels: z.object({
                email: z.boolean().default(false),
                sms: z.boolean().default(false),
                push: z.boolean().default(false),
                whatsapp: z.boolean().default(false),
            }).optional(),
            triggers: z.object({
                booking_confirmation: z.object({ enabled: z.boolean().default(true), channel: z.string().default("push") }).optional(),
                payment_failed: z.object({ enabled: z.boolean().default(true), channel: z.string().default("email") }).optional(),
                birthday_greeting: z.object({ enabled: z.boolean().default(true), channel: z.string().default("sms") }).optional(),
                membership_expiring: z.object({ enabled: z.boolean().default(true), days_before: z.number().default(5) }).optional(),
            }).optional(),
            marketing_consent_required: z.boolean().nullable().optional(),
        }).optional(),

        features: z.object({
            gamification: z.object({
                leaderboards: z.boolean().default(false),
                achievements: z.boolean().default(false),
                social_feed: z.boolean().default(false),
            }).optional(),
            workouts: z.object({
                track_weights: z.boolean().default(false),
                video_library: z.boolean().default(false),
            }).optional(),
            ecommerce: z.object({
                sell_products: z.boolean().default(false),
                click_and_collect: z.boolean().default(false),
            }).optional(),
        }).optional(),

        staffSettings: z.object({
            require_2fa: z.boolean().default(false),
            trainers_can_view_revenue: z.boolean().default(false),
            trainers_can_cancel_classes: z.boolean().default(false),
            reception_can_apply_discounts: z.boolean().default(false),
            max_discount_percent: z.number().nullable().optional(),
        }).optional(),
    }).optional(),
});

export type UpdateOrganizationSettingsInput = z.infer<typeof UpdateOrganizationSettingsSchema>;


export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const UpdateOrganizationSchema = createOrganizationSchema.partial();

export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;

export interface OrganizationsFilters {
    search?: string;
    sort?: string;
    status?: string;
}
