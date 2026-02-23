import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";
import { SyncUserInput } from "@/server/domain/types/clerk-webhook";

export class SyncUserWebhookUseCase {
    constructor(private readonly webhookRepo: IClerkWebhookRepository) { }

    async execute(input: SyncUserInput): Promise<void> {
        await this.webhookRepo.syncUser(input);
    }
}
