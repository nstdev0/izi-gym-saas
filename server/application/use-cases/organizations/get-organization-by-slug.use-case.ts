import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";

export class GetOrganizationBySlugUseCase {
    constructor(
        private readonly repository: IOrganizationRepository,
    ) { }

    async execute(slug: string): Promise<Organization | null> {
        return this.repository.findBySlug(slug);
    }
}
