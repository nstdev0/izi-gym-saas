import { GetProductByIdUseCase } from "@/server/application/use-cases/products/get-product-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { ProductResponse } from "@/shared/types/products.types";
import { ProductResponseMapper } from "../../mappers/product-response.mapper";

export class GetProductByIdController implements ControllerExecutor<void, ProductResponse> {
  constructor(private readonly useCase: GetProductByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<ProductResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const product = await this.useCase.execute(id);
    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }
    return ProductResponseMapper.toResponse(product);
  }
}
