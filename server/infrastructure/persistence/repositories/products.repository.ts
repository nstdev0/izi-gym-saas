import { Prisma } from "@/generated/prisma/client";
import { Product } from "@/server/domain/entities/Product";
import { BaseRepository } from "./base.repository";
import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductsFilters,
} from "@/server/domain/types/products";

export class ProductsRepository
  extends BaseRepository<
    Prisma.ProductDelegate,
    Product,
    CreateProductInput,
    UpdateProductInput,
    ProductsFilters
  >
  implements IProductsRepository
{
  protected async buildQueryFilters(
    filters: ProductsFilters,
  ): Promise<Prisma.ProductWhereInput> {
    const query: Prisma.ProductWhereInput = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.name) {
      query.name = {
        contains: filters.name,
        mode: "insensitive",
      };
    }

    if (filters.search) {
      query.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return query;
  }
}
