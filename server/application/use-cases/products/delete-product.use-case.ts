import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

export class DeleteProductUseCase {
  constructor(private readonly repository: IProductsRepository) { }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
