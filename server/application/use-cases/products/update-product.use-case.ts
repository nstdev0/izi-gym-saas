import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";
import { UpdateProductInput } from "@/server/domain/types/products";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class UpdateProductUseCase {
  constructor(
    private readonly repository: IProductsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string, data: UpdateProductInput): Promise<Product> {
    this.permissions.require('products:update');
    return await this.repository.update(id, data);
  }
}
