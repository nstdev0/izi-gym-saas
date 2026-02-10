import { ControllerExecutor } from "@/server/lib/api-handler";
import { UpdateProductUseCase } from "@/server/application/use-cases/products/update-product.use-case";
import { UpdateProductSchema } from "@/server/application/dtos/products.dto";
import { Product } from "@/server/domain/entities/Product";
import { BadRequestError } from "@/server/domain/errors/common";

export class UpdateProductController implements ControllerExecutor<UpdateProductSchema, Product> {
  constructor(private readonly useCase: UpdateProductUseCase) { }

  async execute(data: UpdateProductSchema, id?: string) {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }

    // data is already validated by route handler
    const product = await this.useCase.execute(id, data);
    return product;
  }
}
