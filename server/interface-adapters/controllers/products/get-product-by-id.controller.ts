import { ControllerExecutor } from "@/server/lib/api-handler";
import { GetProductByIdUseCase } from "@/server/application/use-cases/products/get-product-by-id.use-case";
import { Product } from "@/shared/types/products.types";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";

export class GetProductByIdController implements ControllerExecutor<void, Product | null> {
  constructor(private readonly useCase: GetProductByIdUseCase) { }

  async execute(_input: void, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const product = await this.useCase.execute(id);

    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }

    return product;
  }
}
