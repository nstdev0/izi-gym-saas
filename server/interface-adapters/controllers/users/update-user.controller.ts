import { UpdateUserSchema } from "@/server/application/dtos/users.dto";
import { IUpdateUserUseCase } from "@/server/application/use-cases/users/update-user.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { UpdateUserInput } from "@/server/domain/types/users";

export class UpdateUserController {
  constructor(private readonly useCase: IUpdateUserUseCase) {}

  async execute(id: string, input: unknown) {
    const validatedInput = UpdateUserSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Datos inválidos",
        validatedInput.error.message,
      );
    }

    return await this.useCase.execute(
      id,
      validatedInput.data as unknown as UpdateUserInput,
    );
  }
}
