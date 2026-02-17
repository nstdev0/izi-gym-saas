import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";

export class DeleteOrganizationUseCase {
  constructor(private readonly repository: IOrganizationRepository) { }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

export type IDeleteOrganizationUseCase = InstanceType<typeof DeleteOrganizationUseCase>;

