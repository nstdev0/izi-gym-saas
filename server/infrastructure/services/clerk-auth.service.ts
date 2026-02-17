import { IAuthProvider } from "@/server/application/services/auth-provider.interface";
import { clerkClient, createClerkClient } from "@clerk/nextjs/server";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export class ClerkAuthService implements IAuthProvider {
    async inviteUserToOrganization(data: {
        email: string;
        role: "ADMIN" | "STAFF" | "TRAINER";
        organizationId: string;
        inviterUserId: string;
    }) {
        try {
            console.log(`🚀 Sending Org Invitation: ${data.email} to ${data.organizationId} by ${data.inviterUserId}`);

            const clerkRole = data.role === "ADMIN" ? "org:admin" : "org:member";

            // Obtener detalles de la org para el slug
            const org = await clerk.organizations.getOrganization({
                organizationId: data.organizationId,
            });
            const slug = org.slug || data.organizationId; // Fallback por si acaso

            console.log(`🔗 Redirect Target: /${slug}/admin/dashboard`);

            const invitation = await clerk.organizations.createOrganizationInvitation({
                organizationId: data.organizationId,
                emailAddress: data.email,
                role: clerkRole,
                inviterUserId: data.inviterUserId,
                redirectUrl: process.env.NEXT_PUBLIC_APP_URL + `/${slug}/admin/dashboard`,
                publicMetadata: {
                    appRole: data.role,
                },
            });

            return invitation;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}
