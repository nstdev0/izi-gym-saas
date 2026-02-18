import { ROLE_PERMISSIONS, type Permission, type Role } from '@/shared/types/permissions.types'
import { ForbiddenError } from '@/server/domain/errors/common'
import type { IPermissionService } from '@/server/application/services/permission.service.interface'

export class PermissionService implements IPermissionService {
    constructor(private readonly userRole: Role) { }

    can(action: Permission): boolean {
        return ROLE_PERMISSIONS[this.userRole].includes(action)
    }

    require(action: Permission): void {
        if (!this.can(action)) {
            throw new ForbiddenError(
                `Tu rol (${this.userRole === "ADMIN" ? "Administrador" : this.userRole === "STAFF" ? "Staff" : this.userRole === "TRAINER" ? "Entrenador" : this.userRole}) no tiene permiso para realizar esta acción`
            )
        }
    }
}