export const defaultOrganizationConfig = () => ({
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
})