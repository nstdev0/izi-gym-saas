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
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: "desc" }];

    // Status filter (string or boolean)
    if (filters.status) {
      const status = filters.status.toLowerCase();
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Type filter
    if (filters.type && filters.type !== "all") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query.type = filters.type as any;
    }

    if (filters.search) {
      query.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { sku: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Sort
    if (filters.sort) {
      const [field, direction] = filters.sort.split("-");
      const isValidDirection = direction === "asc" || direction === "desc";
      if (isValidDirection) {
        if (["name", "price", "stock", "createdAt"].includes(field)) {
          orderBy = [{ [field]: direction as Prisma.SortOrder }];
        }
      }
    }

    return [query, orderBy];
  }
}
