import type { PlanFeature, PlanLimits } from '@/shared/types/entitlements.types'

export interface IEntitlementService {
    getLimits(): Promise<PlanLimits>
    requireLimit(resource: 'member' | 'staff'): Promise<void>
    requireFeature(feature: PlanFeature): Promise<void>
    checkStorageLimit(newFileSizeBytes: number): Promise<void>
}
