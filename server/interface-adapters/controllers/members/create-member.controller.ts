import { CreateMemberSchema } from "@/server/application/dtos/create-member.dto";
import { ValidationError } from "@/server/domain/errors/common";
import { ICreateMemberUseCase } from "@use-cases/members/create-member.use-case";

export class CreateMemberController {
  constructor(private readonly createMemberUseCase: ICreateMemberUseCase) {}

  async execute(input: Record<string, unknown>) {
    try {
      const validatedInput = CreateMemberSchema.safeParse(input);

      if (!validatedInput.success) {
        throw new ValidationError(
          "Datos inválidos",
          validatedInput.error.format(),
        );
      }

      return await this.createMemberUseCase.execute(validatedInput.data);
    } catch (error) {
      throw error;
    }
  }
}
