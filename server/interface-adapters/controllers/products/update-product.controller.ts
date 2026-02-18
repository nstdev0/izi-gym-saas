import { ControllerExecutor } from "@/server/lib/api-handler";
import { UpdateProductUseCase } from "@/server/application/use-cases/products/update-product.use-case";
import { UpdateProductInput } from "@/server/application/dtos/products.dto";
import { BadRequestError } from "@/server/domain/errors/common";
import { ProductResponse } from "@/shared/types/products.types";
import { ProductResponseMapper } from "../../mappers/product-response.mapper";

export class UpdateProductController implements ControllerExecutor<UpdateProductInput, ProductResponse> {
  constructor(private readonly useCase: UpdateProductUseCase) { }

  async execute(data: UpdateProductInput, id?: string): Promise<ProductResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const entity = await this.useCase.execute(id, data);
    return ProductResponseMapper.toResponse(entity);
  }
}
