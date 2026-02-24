import { GetOrganizationBySlugUseCase } from "@/server/application/use-cases/organizations/get-organization-by-slug.use-case";

export class GetOrganizationBySlugController {
    constructor(private readonly useCase: GetOrganizationBySlugUseCase) { }

    async execute(input: { slug: string }): Promise<any> {
        return this.useCase.execute(input.slug);
    }
}
