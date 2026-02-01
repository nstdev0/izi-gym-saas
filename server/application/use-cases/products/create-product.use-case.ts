import {
  IProductsRepository,
  CreateProductInput,
} from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

export class CreateProductUseCase {
  constructor(private productsRepository: IProductsRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    return this.productsRepository.create(input);
  }
}
