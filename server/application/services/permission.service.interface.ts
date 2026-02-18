import type { Permission } from '@/shared/types/permissions.types'

export interface IPermissionService {
    can(action: Permission): boolean
    require(action: Permission): void
}
