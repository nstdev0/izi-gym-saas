import { CreateProductUseCase } from "@/server/application/use-cases/products/create-product.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { createProductSchema } from "@/server/application/dtos/products.dto";
import { CreateProductInput } from "@/server/domain/types/products";

export class CreateProductController {
  constructor(private useCase: CreateProductUseCase) { }

  async execute(input: CreateProductInput): Promise<void> {
    const validatedInput = createProductSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Datos de producto inválidos",
        validatedInput.error.flatten().fieldErrors,
      );
    }
    await this.useCase.execute(validatedInput.data);
  }
}
