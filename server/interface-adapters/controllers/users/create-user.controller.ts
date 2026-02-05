import { ICreateUserUseCase } from "@/server/application/use-cases/users/create-user.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { CreateUserSchema } from "@/server/application/dtos/users.dto";

export class CreateUserController {
  constructor(private useCase: ICreateUserUseCase) { }

  async execute(input: unknown) {
    const validatedInput = CreateUserSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Invalid User Data",
        validatedInput.error.message,
      );
    }

    // Obtener sesión para orgId e inviterId
    const { auth } = require("@clerk/nextjs/server");
    const session = await auth();

    if (!session.orgId) throw new Error("No organization selected");
    if (!session.userId) throw new Error("Unauthorized: inviter ID missing");

    return await this.useCase.execute(validatedInput.data, session.orgId, session.userId);
  }
}
