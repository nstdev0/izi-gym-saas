import Stripe from "stripe";

const getStripeConfig = () => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error("STRIPE_SECRET_KEY is not defined");
    }

    return { secretKey };
};

export const stripeClient = new Stripe(getStripeConfig().secretKey, {
    apiVersion: "2026-01-28.clover",
});
