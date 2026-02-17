import { prisma } from "@/server/infrastructure/persistence/prisma";

async function main() {
    console.log("🌱 Starting Organization Plans Seeding...");

    const existingPlans = await prisma.plan.findMany({
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
            name: "Free Trial",
            slug: "free-trial",
            description: "14-day free trial for new gyms. No credit card required.",
            price: 0,
            currency: "USD",
            stripePriceId: "",
            limits: {
                maxMembers: 20,
                canExport: false,
                maxStaff: 2,
                maxLocations: 1
            }
        },
        {
            name: "Pro Plan",
            slug: "pro-monthly",
            description: "Unlimited access for growing gyms.",
            price: 39,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || "price_fake_pro_monthly",
            limits: {
                maxMembers: 1000,
                canExport: true,
                maxStaff: 10,
                maxLocations: 1
            }
        },
        {
            name: "Enterprise",
            slug: "enterprise-monthly",
            description: "For multi-location gym chains.",
            price: 99,
            currency: "USD",
            stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || "price_fake_enterprise",
            limits: {
                maxMembers: 999999, // Ilimitado visualmente
                canExport: true,
                maxStaff: 999,
                maxLocations: 5
            }
        }
    ];

    for (const plan of plans) {
        // Extraemos limits para castearlo, y el resto de data
        const { limits, ...planData } = plan;

        const result = await prisma.organizationPlan.upsert({
            where: { slug: plan.slug },
            update: {
                // En cada deploy, actualizamos descripciones o límites si cambiaron
                ...planData,
                limits: limits as any // 👈 FIX: Casteo explícito para evitar error de Prisma Json
            },
            create: {
                ...planData,
                limits: limits as any // 👈 FIX
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