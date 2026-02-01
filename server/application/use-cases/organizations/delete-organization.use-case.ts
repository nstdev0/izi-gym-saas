import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";

export class DeleteOrganizationUseCase {
  constructor(private readonly repository: IOrganizationRepository) {}

  async execute(id: string): Promise<Organization> {
    return this.repository.delete(id);
  }
}
