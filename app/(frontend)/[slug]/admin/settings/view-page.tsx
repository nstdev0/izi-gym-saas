"use client";

import { useOrganizationDetail } from "@/hooks/organizations/use-organizations";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "./settings-form";

export default function SettingsViewPage({ orgId }: { orgId: string }) {
    const { data: organization, isLoading } = useOrganizationDetail(orgId);

    if (isLoading) {
        return <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Configuración" }]}><div className="flex justify-center p-8">Cargando...</div></DashboardLayout>;
    }

    if (!organization) {
        return <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Configuración" }]}><div>Organización no encontrada</div></DashboardLayout>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (organization.config as any) || {};

    const defaultValues = {
        name: organization.name,
        image: organization.image || "",
        config: {
            identity: {
                website: config.identity?.website || null,
                contact_email: config.identity?.contact_email || null,
                locale: config.locale || config.identity?.locale || "es-PE",
                timezone: config.timezone || config.identity?.timezone || "America/Lima",
                currency: config.currency || config.identity?.currency || "PEN",
            },
            branding: {
                primary_color: config.branding?.primary_color || null,
                secondary_color: config.branding?.secondary_color || null,
                font_family: config.branding?.font_family || null,
                logo_url: config.branding?.logo_url || null,
                favicon_url: config.branding?.favicon_url || null,
                custom_css_enabled: config.branding?.custom_css_enabled || false,
                app_name_override: config.branding?.app_name_override || null,
            },
            billing: {
                tax_settings: config.billing?.tax_settings || { enabled: true, tax_name: "IGV", tax_rate: 0.18, prices_include_tax: true },
                payment_gateways: config.billing?.payment_gateways || { stripe: { enabled: false }, cash: { enabled: true } },
                dunning_management: config.billing?.dunning_management || { retry_attempts: 3 },
                proration_behavior: config.billing?.proration_behavior || "always_invoice",
            },
            booking: {
                booking_window_days: config.booking?.booking_window_days || 7,
                cancellation_policy: config.booking?.cancellation_policy || {},
                waitlist: config.booking?.waitlist || { enabled: true, auto_promote: true, max_size: 5 },
                max_active_bookings: config.booking?.max_active_bookings || 3,
                guest_passes_allowed: config.booking?.guest_passes_allowed ?? true,
            },
            accessControl: {
                provider: config.accessControl?.provider || null,
                hardware_integration_enabled: config.accessControl?.hardware_integration_enabled || false,
                check_in_method: config.accessControl?.check_in_method || ["qr", "manual"],
                allow_entry_grace_period_minutes: config.accessControl?.allow_entry_grace_period_minutes || null,
                anti_passback: config.accessControl?.anti_passback ?? true,
                multi_location_access: config.accessControl?.multi_location_access || false,
            },
            notifications: {
                channels: config.notifications?.channels || { email: false, sms: false, push: false, whatsapp: false },
                triggers: config.notifications?.triggers || {
                    booking_confirmation: { enabled: true, channel: "push" },
                    payment_failed: { enabled: true, channel: "email" },
                    membership_expiring: { enabled: true, days_before: 5 }
                },
                marketing_consent_required: config.notifications?.marketing_consent_required || null,
            },
            features: {
                gamification: config.features?.gamification || { leaderboards: false, achievements: false, social_feed: false },
                workouts: config.features?.workouts || { track_weights: false, video_library: false },
                ecommerce: config.features?.ecommerce || { sell_products: false, click_and_collect: false },
            },
            staffSettings: {
                require_2fa: config.staffSettings?.require_2fa || false,
                trainers_can_view_revenue: config.staffSettings?.trainers_can_view_revenue || false,
                trainers_can_cancel_classes: config.staffSettings?.trainers_can_cancel_classes || false,
                reception_can_apply_discounts: config.staffSettings?.reception_can_apply_discounts || false,
            }
        }
    };

    return (
        <DashboardLayout breadcrumbs={[{ label: "Admin" }, { label: "Configuración" }]}>
            <div className="flex flex-col space-y-6">
                <PageHeader
                    title="Configuración"
                    description="Administra los detalles y preferencias de tu organización"
                />

                <div className="container mx-auto max-w-6xl py-6 space-y-6">
                    <SettingsForm id={orgId} defaultValues={defaultValues} />
                </div>
            </div>
        </DashboardLayout>
    );
}
