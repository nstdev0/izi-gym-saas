import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

export class GetProductByIdUseCase {
  constructor(private readonly repository: IProductsRepository) {}

  async execute(id: string): Promise<Product | null> {
    return this.repository.findUnique({ id });
  }
}
