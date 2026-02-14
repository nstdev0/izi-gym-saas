import { UpdateUserPreferencesUseCase } from "@/server/application/use-cases/users/update-user-preferences.use-case";
import { UpdateUserPreferencesController } from "@/server/interface-adapters/controllers/users/user-preferences.controller";

const useCase = new UpdateUserPreferencesUseCase();
const controller = new UpdateUserPreferencesController(useCase);

export async function PATCH(request: Request) {
    return controller.handle(request);
}
