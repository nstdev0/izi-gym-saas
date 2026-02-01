import { UpdateMemberSchema } from "@/server/application/dtos/members.dto";
import { IUpdateMemberUseCase } from "@/server/application/use-cases/members/update-member.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { UpdateMemberInput } from "@/server/domain/types/members";

export class UpdateMemberController {
  constructor(private readonly updateMemberUseCase: IUpdateMemberUseCase) {}

  async execute(id: string, input: unknown) {
    const validatedInput = UpdateMemberSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Datos inválidos",
        validatedInput.error.message,
      );
    }

    return await this.updateMemberUseCase.execute(
      id,
      validatedInput.data as unknown as UpdateMemberInput,
    );
  }
}
