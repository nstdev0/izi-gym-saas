import { createContext } from "@/server/lib/api-handler";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = createContext(
    (c) => c.createCheckoutSessionController,
    async (req) => {
        const { orgId, userId } = await auth();

        if (!orgId || !userId) {
            throw new Error("No autenticado");
        }

        const body = await req.json();
        const planSlug = body.planId; // The prompt mentioned planId might actually receive a slug

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
