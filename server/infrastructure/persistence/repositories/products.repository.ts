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
  implements IProductsRepository {
  protected async buildPrismaClauses(
    filters: ProductsFilters,
  ): Promise<[Prisma.ProductWhereInput, Prisma.ProductOrderByWithRelationInput[]]> {
    const query: Prisma.ProductWhereInput = {};
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = [];

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

    return [query, orderBy];
  }
}
