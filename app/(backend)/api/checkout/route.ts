import { createContext } from "@/server/lib/api-handler";
import { auth } from "@clerk/nextjs/server";

export const POST = createContext(
    (c) => c.createCheckoutSessionController,
    async (req) => {
        const session = await auth();
        const { orgId, userId, orgRole } = session;

        if (!orgId || !userId) {
            throw new Error("No autenticado");
        }

        // Solo el admin/owner de la organización puede iniciar un checkout
        if (orgRole !== 'org:admin') {
            throw Object.assign(
                new Error("Solo el administrador de la organización puede gestionar el plan"),
                { statusCode: 403, code: "FORBIDDEN" }
            );
        }

        const body = await req.json();
        const planSlug = body.planId;

        if (!planSlug) {
            throw new Error("Falta el planSlug o planId");
        }

        return {
            organizationId: orgId,
            planSlug,
            userId,
        };
    }
);
