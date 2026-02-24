import { PrismaClient } from "@/generated/prisma/client";
import { PrismaUnitOfWork } from "@/server/infrastructure/persistence/prisma-unit-of-work";
import { StripeBillingProvider } from "@/server/infrastructure/billing/stripe.provider";
import { SyncStripeEventUseCase } from "@/server/application/use-cases/webhooks/stripe/sync-stripe-event.use-case";

export function createStripeWebhookModule(prisma: PrismaClient) {
    const uow = new PrismaUnitOfWork(prisma);
    const billingProvider = new StripeBillingProvider();

    return {
        syncStripeEventUseCase: new SyncStripeEventUseCase(uow, billingProvider),
    };
}
