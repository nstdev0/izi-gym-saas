import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

export class DeleteProductUseCase {
  constructor(private readonly repository: IProductsRepository) {}

  async execute(id: string): Promise<Product> {
    return this.repository.delete(id);
  }
}
