import { Role } from "@/shared/types/users.types";

export interface IAuthProvider {
    getUserById(id: string): Promise<{ email: string; imageUrl: string } | null>
    inviteUserToOrganization(data: { email: string, role: Role, organizationId: string, inviterUserId: string }): Promise<void>
    getSession(): Promise<{ userId: string; orgId: string } | null>
    getClient(): Promise<any>
}