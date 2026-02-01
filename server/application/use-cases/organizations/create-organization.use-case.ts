import { IOrganizationRepository } from "@/server/application/repositories/organizations.repository.interface";
import { Organization } from "@/server/domain/entities/Organization";
import { CreateOrganizationInput } from "@/server/domain/types/organizations";

export class CreateOrganizationUseCase {
  constructor(private readonly repository: IOrganizationRepository) {}

  async execute(
    input: CreateOrganizationInput,
    userId: string,
  ): Promise<Organization> {
    // Aquí podríamos agregar validaciones de dominio adicionales si fuera necesario
    // Por ahora, delegamos la transacción compleja al repositorio
    return await this.repository.createWithTransaction(input, userId);
  }
}
