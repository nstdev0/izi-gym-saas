import type { IOrganizationRepository } from '@/server/application/repositories/organizations.repository.interface'
import type { IMembersRepository } from '@/server/application/repositories/members.repository.interface'
import type { IUsersRepository } from '@/server/application/repositories/users.repository.interface'
import type { Role } from '@/shared/types/permissions.types'
import { PermissionService } from '@/server/infrastructure/services/permission.service'
import { EntitlementService } from '@/server/infrastructure/services/entitlement.service'

export function createAuthModule(
    organizationRepo: IOrganizationRepository,
    memberRepo: IMembersRepository,
    userRepo: IUsersRepository,
    userRole: Role | undefined,
    organizationId: string,
) {
    const permissionService = new PermissionService(userRole)
    const entitlementService = new EntitlementService(
        organizationRepo,
        memberRepo,
        userRepo,
        organizationId,
    )

    return { permissionService, entitlementService }
}

export type AuthModule = ReturnType<typeof createAuthModule>
