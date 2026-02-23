import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";

export class RemoveMembershipWebhookUseCase {
    constructor(private readonly webhookRepo: IClerkWebhookRepository) { }

    async execute(userId: string): Promise<void> {
        await this.webhookRepo.removeMembership(userId);
    }
}
