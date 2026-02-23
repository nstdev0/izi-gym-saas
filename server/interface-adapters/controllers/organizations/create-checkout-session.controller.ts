import { CreateCheckoutSessionUseCase } from "@/server/application/use-cases/organizations/create-checkout-session.use-case";

export class CreateCheckoutSessionController {
    constructor(private readonly useCase: CreateCheckoutSessionUseCase) { }

    async execute({
        organizationId,
        planSlug,
        userId,
    }: {
        organizationId: string;
        planSlug: string;
        userId: string;
    }) {
        const session = await this.useCase.execute(organizationId, planSlug, userId);
        return { url: session.url };
    }
}
