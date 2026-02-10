import { ControllerExecutor } from "@/server/lib/api-handler";
import { DeleteProductUseCase } from "@/server/application/use-cases/products/delete-product.use-case";
import { Product } from "@/server/domain/entities/Product";
import { BadRequestError } from "@/server/domain/errors/common";

export class DeleteProductController implements ControllerExecutor<void, Product> {
  constructor(private readonly useCase: DeleteProductUseCase) { }

  async execute(_input: void, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const product = await this.useCase.execute(id);
    return product;
  }
}
