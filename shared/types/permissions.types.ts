import { Role } from '@/shared/types/users.types'

export type Permission =
    | 'members:read' | 'members:create' | 'members:update' | 'members:delete'
    | 'memberships:read' | 'memberships:create' | 'memberships:update' | 'memberships:delete'
    | 'plans:read' | 'plans:create' | 'plans:update' | 'plans:delete'
    | 'products:read' | 'products:create' | 'products:update' | 'products:delete'
    | 'attendance:read' | 'attendance:create' | 'attendance:update' | 'attendance:delete'
    | 'users:read' | 'users:create' | 'users:update' | 'users:delete'
    | 'org:read' | 'org:list' | 'org:update' | 'org:billing' | 'org:delete'
    | 'dashboard:read' | 'dashboard:financials'

const ALL_PERMISSIONS: Permission[] = [
    'members:read', 'members:create', 'members:update', 'members:delete',
    'memberships:read', 'memberships:create', 'memberships:update', 'memberships:delete',
    'plans:read', 'plans:create', 'plans:update', 'plans:delete',
    'products:read', 'products:create', 'products:update', 'products:delete',
    'attendance:read', 'attendance:create', 'attendance:update', 'attendance:delete',
    'users:read', 'users:create', 'users:update', 'users:delete',
    'org:read', 'org:list', 'org:update', 'org:billing', 'org:delete',
    'dashboard:read', 'dashboard:financials',
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    GOD: ALL_PERMISSIONS,
    OWNER: ALL_PERMISSIONS.filter(p => p !== 'org:list'),
    ADMIN: ALL_PERMISSIONS.filter(p => !['org:billing', 'org:delete', 'org:list'].includes(p)),
    STAFF: [
        'members:read', 'members:create', 'members:update',
        'memberships:read', 'memberships:create', 'memberships:update',
        'plans:read',
        'products:read', 'products:create', 'products:update',
        'attendance:read', 'attendance:create', 'attendance:update',
        'dashboard:read',
        'org:read',
    ],
    TRAINER: ['members:read', 'attendance:read', 'attendance:create', 'plans:read', 'org:read'],
}

export type RolePermissions = typeof ROLE_PERMISSIONS

export { Role } from '@/shared/types/users.types'
