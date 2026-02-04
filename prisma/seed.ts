import { prisma } from "@/server/infrastructure/persistence/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Free Trial Plan
  const freePlan = await prisma.organizationPlan.upsert({
    where: { slug: "free-trial" },
    update: {},
    create: {
      name: "Free Trial",
      slug: "free-trial",
      description: "14-day free trial for new gyms",
      price: 0,
      currency: "USD",
      limits: {
        maxMembers: 50,
        canExport: false,
        maxStaff: 2,
      },
    },
  });

  console.log(`✅ Plan "${freePlan.name}" ensured (ID: ${freePlan.id})`);

  // 2. Create Pro Plan
  const proPlan = await prisma.organizationPlan.upsert({
    where: { slug: "pro-monthly" },
    update: {},
    create: {
      name: "Pro Plan",
      slug: "pro-monthly",
      description: "Unlimited access for growing gyms",
      price: 29,
      currency: "USD",
      stripePriceId: "price_fake_pro_monthly", // Dummy ID for dev/test
      limits: {
        maxMembers: 1000,
        canExport: true,
        maxStaff: 10,
      },
    },
  });

  console.log(`✅ Plan "${proPlan.name}" ensured (ID: ${proPlan.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
