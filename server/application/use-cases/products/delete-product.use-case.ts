import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class DeleteProductUseCase {
  constructor(
    private readonly repository: IProductsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<void> {
    this.permissions.require('products:delete');
    await this.repository.delete(id);
  }
}
