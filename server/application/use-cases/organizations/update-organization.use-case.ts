import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";
import { UpdateOrganizationInput } from "@/server/domain/types/organizations";

export class UpdateOrganizationUseCase {
  constructor(private readonly repository: IOrganizationRepository) { }

  async execute(
    id: string,
    data: UpdateOrganizationInput,
  ): Promise<void> {
    await this.repository.update(id, data);
  }
}

export type IUpdateOrganizationUseCase = InstanceType<typeof UpdateOrganizationUseCase>;

