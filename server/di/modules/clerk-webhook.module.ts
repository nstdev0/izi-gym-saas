import { PrismaClient } from "@/generated/prisma/client";
import { ClerkWebhookRepository } from "@/server/infrastructure/persistence/repositories/clerk-webhook.repository";
import { SyncUserWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-user.use-case";
import { DeleteUserWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/delete-user.use-case";
import { SyncOrganizationWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-organization.use-case";
import { DeleteOrganizationWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/delete-organization.use-case";
import { SyncMembershipWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/sync-membership.use-case";
import { RemoveMembershipWebhookUseCase } from "@/server/application/use-cases/webhooks/clerk/remove-membership.use-case";

export function createClerkWebhookModule(prisma: PrismaClient) {
    const clerkWebhookRepository = new ClerkWebhookRepository(prisma);

    const syncUserUseCase = new SyncUserWebhookUseCase(clerkWebhookRepository);
    const deleteUserUseCase = new DeleteUserWebhookUseCase(clerkWebhookRepository);
    const syncOrganizationUseCase = new SyncOrganizationWebhookUseCase(clerkWebhookRepository);
    const deleteOrganizationUseCase = new DeleteOrganizationWebhookUseCase(clerkWebhookRepository);
    const syncMembershipUseCase = new SyncMembershipWebhookUseCase(clerkWebhookRepository);
    const removeMembershipUseCase = new RemoveMembershipWebhookUseCase(clerkWebhookRepository);

    return {
        syncUserUseCase,
        deleteUserUseCase,
        syncOrganizationUseCase,
        deleteOrganizationUseCase,
        syncMembershipUseCase,
        removeMembershipUseCase,
    };
}
