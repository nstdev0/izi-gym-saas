import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";

export class GetOrganizationByIdUseCase {
  constructor(private readonly repository: IOrganizationRepository) {}

  async execute(id: string): Promise<Organization | null> {
    return this.repository.findUnique({ id });
  }
}
