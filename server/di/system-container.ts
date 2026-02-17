import { cache } from "react";
import { prisma } from "@/server/infrastructure/persistence/prisma";
import { OrganizationsRepository } from "@/server/infrastructure/persistence/repositories/organizations.repository";
import { GetAllOrganizationsUseCase } from "../application/use-cases/organizations/get-all-organizations.use-case";
// ...

export const getSystemContainer = cache(async () => {
  // NOTA: No necesitamos inyectar Tenant ID porque queremos ver TODO.

  // Repositorio instanciado SIN organizationId -> Ve todo
  const organizationsRepo = new OrganizationsRepository(
    prisma.organization,
  );

  // Use Case para listar organizaciones
  const getAllOrgsUseCase = new GetAllOrganizationsUseCase(organizationsRepo);

  return {
    getAllOrgsUseCase,
    // ...
  };
});
