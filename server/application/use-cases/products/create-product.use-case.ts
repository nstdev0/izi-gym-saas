import {
  IProductsRepository,
  CreateProductInput,
} from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class CreateProductUseCase {
  constructor(
    private productsRepository: IProductsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(input: CreateProductInput): Promise<Product> {
    this.permissions.require('products:create');
    return await this.productsRepository.create(input);
  }
}
