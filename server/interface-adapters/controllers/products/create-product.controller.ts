import { CreateProductUseCase } from "@/server/application/use-cases/products/create-product.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { createProductSchema } from "@/server/application/dtos/products.dto";

export class CreateProductController {
  constructor(private useCase: CreateProductUseCase) {}

  async execute(input: unknown) {
    const validatedInput = createProductSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Invalid Product Data",
        validatedInput.error.message,
      );
    }

    return await this.useCase.execute(validatedInput.data);
  }
}
