import { DeleteProductUseCase } from "@/server/application/use-cases/products/delete-product.use-case";

export class DeleteProductController {
  constructor(private readonly useCase: DeleteProductUseCase) {}

  async execute(id: string) {
    const product = await this.useCase.execute(id);
    return product;
  }
}
