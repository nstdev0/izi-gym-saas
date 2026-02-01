import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";
import { UpdateProductInput } from "@/server/domain/types/products";

export class UpdateProductUseCase {
  constructor(private readonly repository: IProductsRepository) {}

  async execute(id: string, data: UpdateProductInput): Promise<Product> {
    return this.repository.update(id, data);
  }
}
