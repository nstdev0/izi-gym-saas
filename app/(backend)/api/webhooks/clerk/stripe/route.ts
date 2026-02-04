import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { SubscriptionStatus } from "@/generated/prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover" as any,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    // 1. Verificar que la llamada viene REALMENTE de Stripe
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // 2. Manejar Eventos
    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        // Recuperar la metadata que enviamos en el paso anterior
        const organizationId = session.metadata?.organizationId;
        const planId = session.metadata?.planId;

        if (!organizationId || !planId) {
            return NextResponse.json({ error: "Metadata missing" }, { status: 400 });
        }

        console.log(`💰 Pago recibido para Org: ${organizationId}`);

        // 3. ACTUALIZAR BASE DE DATOS (Activar Plan)
        await prisma.subscription.upsert({
            where: { organizationId },
            create: {
                organizationId,
                organizationPlanId: planId,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Stripe te da la fecha real, esto es fallback
            },
            update: {
                organizationPlanId: planId, // Actualizamos el plan
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: SubscriptionStatus.ACTIVE,
            },
        });

        // Actualizar también la relación directa en la Organización (para consultas rápidas)
        await prisma.organization.update({
            where: { id: organizationId },
            data: { organizationPlanId: planId }
        });
    }

    // Manejar otros eventos como 'invoice.payment_failed' para cancelar acceso...

    return NextResponse.json({ received: true });
}
