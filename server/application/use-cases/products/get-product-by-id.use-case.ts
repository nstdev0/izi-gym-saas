import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetProductByIdUseCase {
  constructor(
    private readonly repository: IProductsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(id: string): Promise<Product | null> {
    this.permissions.require('products:read');
    return this.repository.findUnique({ id });
  }
}
