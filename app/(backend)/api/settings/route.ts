import { prisma } from "@/server/infrastructure/persistence/prisma";
import { OrganizationsRepository } from "@/server/infrastructure/persistence/repositories/organizations.repository";
import { UpdateOrganizationSettingsUseCase } from "@/server/application/use-cases/organizations/update-organization-settings.use-case";
import { UpdateOrganizationSettingsController } from "@/server/interface-adapters/controllers/organizations/update-organization-settings.controller";
import { createContext } from "@/server/lib/api-handler";
import { UpdateOrganizationSettingsSchema } from "@/server/application/dtos/organizations.dto";

const organizationsRepository = new OrganizationsRepository(prisma.organization);
const useCase = new UpdateOrganizationSettingsUseCase(organizationsRepository);
const controller = new UpdateOrganizationSettingsController(useCase);

const requestMapper = async (req: Request) => {
    const body = await req.json();
    return UpdateOrganizationSettingsSchema.parse(body);
};

export const PATCH = createContext(() => controller, requestMapper);
