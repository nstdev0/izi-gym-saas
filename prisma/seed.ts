import { prisma } from "@/server/infrastructure/persistence/prisma";
import { PLAN_LIMITS } from "@/shared/types/entitlements.types";

async function main() {
    console.log("🌱 Starting Organization Plans Seeding...");

    const existingPlans = await prisma.organizationPlan.findMany({
        where: {
            slug: {
                in: ["free-trial", "pro-monthly", "enterprise-monthly"]
            }
        }
    })

    if (existingPlans.length > 0) {
        console.log("Plans already exist, skipping seeding.");
        return;
    }

    const plans = [
        {
            name: "FREE_TRIAL",
            slug: "free-trial",
            description: "Free plan for small gyms. No credit card required.",
            price: 0,
            currency: "USD",
            stripePriceId: "",
            interval: "MONTH",
            limits: PLAN_LIMITS.FREE_TRIAL
        },
        {
            name: "PRO_MONTHLY",
            slug: "pro-monthly",
            description: "Grow your gym with our Pro plan.",
            price: 49,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_fake_pro_monthly",
            interval: "MONTH",
            limits: PLAN_LIMITS.PRO_MONTHLY
        },
        {
            name: "PRO_YEARLY",
            slug: "pro-yearly",
            description: "Grow your gym with our Pro plan.",
            price: 49,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_PRO_YEARLY || "price_fake_pro_yearly",
            interval: "YEAR",
            limits: PLAN_LIMITS.PRO_YEARLY
        },
        {
            name: "ENTERPRISE_MONTHLY",
            slug: "enterprise-monthly",
            description: "For multi-location gym chains.",
            price: 99,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_fake_enterprise",
            interval: "MONTH",
            limits: PLAN_LIMITS.ENTERPRISE_MONTHLY
        },
        {
            name: "ENTERPRISE_YEARLY",
            slug: "enterprise-yearly",
            description: "For multi-location gym chains.",
            price: 99,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || "price_fake_enterprise",
            interval: "YEAR",
            limits: PLAN_LIMITS.ENTERPRISE_YEARLY
        },
        // {
        //     name: "LIFETIME",
        //     slug: "lifetime",
        //     description: "For multi-location gym chains.",
        //     price: 5000,
        //     currency: "USD",
        //     stripePriceId: process.env.STRIPE_PRICE_LIFETIME || "price_fake_lifetime",
        //     interval: "LIFETIME",
        //     limits: PLAN_LIMITS.LIFETIME
        // }
    ];

    for (const plan of plans) {
        // Extraemos limits para castearlo, y el resto de data
        const { limits, ...planData } = plan;

        const result = await prisma.organizationPlan.upsert({
            where: { slug: plan.slug },
            update: {
                ...planData,
                limits: limits as any,
                interval: plan.interval as "MONTH" | "YEAR",
            },
            create: {
                ...planData,
                limits: limits as any,
                interval: plan.interval as "MONTH" | "YEAR",
            },
        });

        console.log(`✅ Plan ensured: ${result.name} (${result.slug})`);
    }

    console.log("🌿 Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });