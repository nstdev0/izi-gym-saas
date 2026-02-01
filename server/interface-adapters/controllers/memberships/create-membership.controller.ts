import { ICreateMembershipUseCase } from "@/server/application/use-cases/memberships/create-membership.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { createMembershipSchema } from "@/server/application/dtos/memberships.dto";

export class CreateMembershipController {
  constructor(private useCase: ICreateMembershipUseCase) {}

  async execute(input: unknown) {
    const validatedInput = createMembershipSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Invalid Membership Data",
        validatedInput.error.message,
      );
    }

    return await this.useCase.execute(validatedInput.data);
  }
}
