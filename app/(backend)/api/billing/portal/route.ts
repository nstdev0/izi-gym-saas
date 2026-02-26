import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/server/infrastructure/persistence/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover" as any,
});

export async function POST() {
    const session = await auth();
    const { orgId, userId, orgRole } = session;

    if (!orgId || !userId) {
        return NextResponse.json(
            { message: "No autenticado" },
            { status: 401 }
        );
    }

    // Solo admin puede gestionar facturación
    if (orgRole !== "org:admin") {
        return NextResponse.json(
            { message: "Solo el administrador puede gestionar la facturación" },
            { status: 403 }
        );
    }

    // Buscar la organización para obtener el stripeCustomerId
    const isClerkId = orgId.startsWith("org_");
    const organization = await prisma.organization.findUnique({
        where: isClerkId ? { organizationId: orgId } : { id: orgId },
        select: { stripeCustomerId: true, slug: true },
    });

    if (!organization?.stripeCustomerId) {
        return NextResponse.json(
            { message: "No hay perfil de facturación activo. Primero debes suscribirte a un plan." },
            { status: 400 }
        );
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const returnUrl = `${baseUrl}/${organization.slug}/admin/dashboard`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: organization.stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error: any) {
        console.error("[Billing Portal] Error creating portal session:", error);
        return NextResponse.json(
            { message: "Error al crear sesión del portal de facturación" },
            { status: 500 }
        );
    }
}
