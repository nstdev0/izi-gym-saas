import { CreatePlanUseCase } from "@/server/application/use-cases/plans/create-plan.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { createPlanSchema } from "@/server/application/dtos/plans.dto";

export class CreatePlanController {
  constructor(private readonly useCase: CreatePlanUseCase) {}

  async execute(input: unknown) {
    const validatedInput = createPlanSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Datos de Plan Inválidos",
        validatedInput.error.message,
      );
    }

    return await this.useCase.execute(validatedInput.data);
  }
}
