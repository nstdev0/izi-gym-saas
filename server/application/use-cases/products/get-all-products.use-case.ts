import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { ProductsFilters } from "@/server/domain/types/products";
import { Product } from "@/server/domain/entities/Product";
import { PageableResponse } from "@/shared/common/pagination";

import { IPermissionService } from "@/server/application/services/permission.service.interface";

export class GetAllProductsUseCase {
  constructor(
    private productsRepository: IProductsRepository,
    private readonly permissions: IPermissionService
  ) { }

  async execute(
    filters: ProductsFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageableResponse<Product>> {
    this.permissions.require('products:read');
    return this.productsRepository.findAll({ filters, page, limit });
  }
}
