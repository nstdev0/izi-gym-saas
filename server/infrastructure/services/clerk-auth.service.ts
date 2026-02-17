import { IAuthProvider } from "@/server/application/services/auth-provider.interface";
import { auth, clerkClient, createClerkClient } from "@clerk/nextjs/server";
import { Role } from "@/shared/types/users.types";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export class ClerkAuthService implements IAuthProvider {
    async getSession(): Promise<{ userId: string; orgId: string; } | null> {
        const session = await auth();
        if (!session?.userId || !session?.orgId) {
            return null;
        }
        return {
            userId: session.userId,
            orgId: session.orgId,
        };
    }
    async inviteUserToOrganization(data: {
        email: string;
        role: Role;
        organizationId: string;
        inviterUserId: string;
    }): Promise<void> {
        try {
            console.log(`🚀 Sending Org Invitation: ${data.email} to ${data.organizationId} by ${data.inviterUserId}`);

            const clerkRole = data.role === "ADMIN" ? "org:admin" : "org:member";

            // Obtener detalles de la org para el slug
            const org = await clerk.organizations.getOrganization({
                organizationId: data.organizationId,
            });
            const slug = org.slug || data.organizationId; // Fallback por si acaso

            console.log(`🔗 Redirect Target: /${slug}/admin/dashboard`);

            await clerk.organizations.createOrganizationInvitation({
                organizationId: data.organizationId,
                emailAddress: data.email,
                role: clerkRole,
                inviterUserId: data.inviterUserId,
                redirectUrl: process.env.NEXT_PUBLIC_APP_URL + `/${slug}/admin/dashboard`,
                publicMetadata: {
                    appRole: data.role,
                },
            });

        } catch (error: any) {
            console.error("❌ Org Invitation Error:", JSON.stringify(error, null, 2));
            if (error.errors?.[0]?.code === "resource_not_found") {
                throw new Error("Organización no encontrada. IDs incorrectos.");
            }
            if (error.errors?.[0]?.code === "form_identifier_exists") {
                throw new Error("Este usuario ya ha sido invitado o es miembro.");
            }
            if (error.errors?.[0]?.message?.includes("already")) {
                throw new Error("El usuario ya tiene una invitación pendiente o es miembro.");
            }
            throw error;
        }
    }

    async getUserById(id: string): Promise<{ email: string; imageUrl: string; } | null> {
        const client = await clerkClient()
        const user = await client.users.getUser(id)
        return {
            email: user.emailAddresses[0]?.emailAddress ?? null,
            imageUrl: user.imageUrl,
        }
    }

    async getClient() {
        return clerkClient();
    }
}
