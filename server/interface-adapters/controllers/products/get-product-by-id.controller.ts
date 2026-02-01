import { GetProductByIdUseCase } from "@/server/application/use-cases/products/get-product-by-id.use-case";

export class GetProductByIdController {
  constructor(private readonly useCase: GetProductByIdUseCase) {}

  async execute(id: string) {
    const product = await this.useCase.execute(id);
    return product;
  }
}
