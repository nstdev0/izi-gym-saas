import { IClerkWebhookRepository } from "@/server/application/repositories/clerk-webhook.repository.interface";

export class DeleteUserWebhookUseCase {
    constructor(private readonly webhookRepo: IClerkWebhookRepository) { }

    async execute(id: string): Promise<void> {
        await this.webhookRepo.deleteUser(id);
    }
}
