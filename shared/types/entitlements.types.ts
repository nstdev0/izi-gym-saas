export type PlanFeature = 'invoicing' | 'api_access'

export interface PlanLimits {
    maxMembers: number | null
    maxStaff: number | null
    maxStorageBytes: number
    features: Record<PlanFeature, boolean>
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
    FREE_TRIAL: {
        maxMembers: 50,
        maxStaff: 2,
        maxStorageBytes: 524_288_000,
        features: { invoicing: false, api_access: false },
    },
    PRO_MONTHLY: {
        maxMembers: 500,
        maxStaff: 5,
        maxStorageBytes: 5_368_709_120,
        features: { invoicing: true, api_access: false },
    },
    ENTERPRISE_MONTHLY: {
        maxMembers: null,
        maxStaff: null,
        maxStorageBytes: 53_687_091_200,
        features: { invoicing: true, api_access: true },
    },
    PRO_YEARLY: {
        maxMembers: 500,
        maxStaff: 5,
        maxStorageBytes: 5_368_709_120,
        features: { invoicing: true, api_access: false },
    },
    ENTERPRISE_YEARLY: {
        maxMembers: null,
        maxStaff: null,
        maxStorageBytes: 53_687_091_200,
        features: { invoicing: true, api_access: true },
    },
}
