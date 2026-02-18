import { CreateProductUseCase } from "@/server/application/use-cases/products/create-product.use-case";
import { ValidationError } from "@/server/domain/errors/common";
import { createProductSchema } from "@/server/application/dtos/products.dto";
import { CreateProductInput } from "@/server/domain/types/products";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { ProductResponse } from "@/shared/types/products.types";
import { ProductResponseMapper } from "../../mappers/product-response.mapper";

export class CreateProductController implements ControllerExecutor<CreateProductInput, ProductResponse> {
  constructor(private useCase: CreateProductUseCase) { }

  async execute(input: CreateProductInput): Promise<ProductResponse> {
    const validatedInput = createProductSchema.safeParse(input);

    if (!validatedInput.success) {
      throw new ValidationError(
        "Datos de producto inválidos",
        validatedInput.error.flatten().fieldErrors,
      );
    }
    const entity = await this.useCase.execute(validatedInput.data);
    return ProductResponseMapper.toResponse(entity);
  }
}
