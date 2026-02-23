import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";
import { SyncMembershipInput } from "@/server/domain/types/clerk-webhook";

export class SyncMembershipWebhookUseCase {
    constructor(private readonly webhookRepo: IClerkWebhookRepository) { }

    async execute(input: SyncMembershipInput): Promise<void> {
        const freePlan = await this.webhookRepo.getFreePlan();
        await this.webhookRepo.syncMembership(input, freePlan.id, freePlan.name);
    }
}
