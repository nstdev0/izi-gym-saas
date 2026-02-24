import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeWebhookContainer } from "@/server/di/container";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover" as any,
});

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`⚠️ Webhook signature verification failed.`, err.message);
        return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    try {
        const container = await getStripeWebhookContainer();
        await container.syncStripeEventUseCase.execute(event);

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error) {
        console.error(`[Stripe Webhook Error]`, error);
        return NextResponse.json({ message: "Error interno procesando el webhook" }, { status: 500 });
    }
}
