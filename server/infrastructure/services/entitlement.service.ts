import { PLAN_LIMITS, type PlanFeature, type PlanLimits } from '@/shared/types/entitlements.types'
import { ForbiddenError, LimitExceededError } from '@/server/domain/errors/common'
import type { IEntitlementService } from '@/server/application/services/entitlement.service.interface'
import type { IOrganizationRepository } from '@/server/application/repositories/organizations.repository.interface'
import type { IMembersRepository } from '@/server/application/repositories/members.repository.interface'
import type { IUsersRepository } from '@/server/application/repositories/users.repository.interface'

class EntitlementService implements IEntitlementService {
    constructor(
        private readonly organizationRepo: IOrganizationRepository,
        private readonly memberRepo: IMembersRepository,
        private readonly userRepo: IUsersRepository,
        private readonly organizationId: string,
    ) { }

    async getLimits(): Promise<PlanLimits> {
        const org = await this.organizationRepo.findByIdWithPlan(this.organizationId)
        const planKey = org?.plan?.name ?? 'FREE'
        const defaults = PLAN_LIMITS[planKey] ?? PLAN_LIMITS['FREE']
        const overrides = (org?.plan?.limits ?? {}) as Partial<PlanLimits>

        return { ...defaults, ...overrides }
    }

    async requireLimit(resource: 'member' | 'staff'): Promise<void> {
        const limits = await this.getLimits()

        if (resource === 'member') {
            const max = limits.maxMembers
            if (max === null) return
            const current = await this.memberRepo.countActive(this.organizationId)
            if (current >= max) throw new LimitExceededError('member', max)
        }

        if (resource === 'staff') {
            const max = limits.maxStaff
            if (max === null) return
            const current = await this.userRepo.countActive(this.organizationId)
            if (current >= max) throw new LimitExceededError('staff', max)
        }
    }

    async requireFeature(feature: PlanFeature): Promise<void> {
        const limits = await this.getLimits()
        if (!limits.features[feature]) {
            throw new ForbiddenError(
                `La función "${feature}" no está disponible en tu plan actual. Actualiza para acceder.`
            )
        }
    }

    async checkStorageLimit(newFileSizeBytes: number): Promise<void> {
        const org = await this.organizationRepo.findByIdWithPlan(this.organizationId)
        const limits = await this.getLimits()
        const currentUsed = Number(org?.storageUsed ?? BigInt(0))
        const projected = currentUsed + newFileSizeBytes

        if (projected > limits.maxStorageBytes) {
            throw new LimitExceededError('storage', limits.maxStorageBytes)
        }
    }
}

export { EntitlementService }
