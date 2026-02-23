import { PrismaClient } from "@/generated/prisma/client";
import { ClerkWebhookRepository } from "@/server/infrastructure/persistence/repositories/clerk-webhook.repository";
import { SyncUserWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-user.use-case";
import { DeleteUserWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/delete-user.use-case";
import { SyncOrganizationWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-organization.use-case";
import { DeleteOrganizationWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/delete-organization.use-case";
import { SyncMembershipWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-membership.use-case";
import { RemoveMembershipWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/remove-membership.use-case";

export function createClerkWebhookModule(prisma: PrismaClient) {
    const webhookRepository = new ClerkWebhookRepository(prisma);

    const syncUserUseCase = new SyncUserWebhookUseCase(webhookRepository);
    const deleteUserUseCase = new DeleteUserWebhookUseCase(webhookRepository);
    const syncOrganizationUseCase = new SyncOrganizationWebhookUseCase(webhookRepository);
    const deleteOrganizationUseCase = new DeleteOrganizationWebhookUseCase(webhookRepository);
    const syncMembershipUseCase = new SyncMembershipWebhookUseCase(webhookRepository);
    const removeMembershipUseCase = new RemoveMembershipWebhookUseCase(webhookRepository);

    return {
        syncUserUseCase,
        deleteUserUseCase,
        syncOrganizationUseCase,
        deleteOrganizationUseCase,
        syncMembershipUseCase,
        removeMembershipUseCase,
    };
}
