import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";
import { SyncOrganizationInput } from "@/server/domain/types/clerk-webhook";

export class SyncOrganizationWebhookUseCase {
    constructor(private readonly webhookRepo: IClerkWebhookRepository) { }

    async execute(input: SyncOrganizationInput): Promise<void> {
        const freePlan = await this.webhookRepo.getFreePlan();
        await this.webhookRepo.syncOrganization(input, freePlan.id, freePlan.name, freePlan.price);
    }
}
