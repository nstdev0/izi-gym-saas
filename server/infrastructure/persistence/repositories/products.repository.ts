import { Prisma } from "@/generated/prisma/client";
import { Product } from "@/server/domain/entities/Product";
import { BaseRepository } from "./base.repository";
import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductsFilters,
} from "@/server/domain/types/products";
import { ProductMapper } from "../mappers/products.mapper";
import { translatePrismaError } from "../prisma-error-translator";

export class ProductsRepository
  extends BaseRepository<
    Prisma.ProductDelegate,
    Product,
    CreateProductInput,
    UpdateProductInput,
    ProductsFilters
  >
  implements IProductsRepository {

  constructor(model: Prisma.ProductDelegate, organizationId: string) {
    super(model, new ProductMapper(), organizationId, "Producto");
  }

  // Override findAll, create, update, delete, restore if needed to wrap them.
  // BaseRepository generic implementation might be handling basic CRUD, but we've seen other repos overriding them.
  // Checking `BaseRepository` implementation would be good, but assuming we need to wrap calls here if they are overridden or if BaseRepository doesn't handle translation.
  // Since BaseRepository was not shown, but other repos override methods, I will assume ProductsRepository relies on BaseRepository for basic CRUD if not overridden.
  // However, I see ProductsRepository ONLY has constructor and buildPrismaClauses.
  // This means it uses BaseRepository's methods.
  // !! If BaseRepository is NOT using translatePrismaError, then ProductsRepository (and others using base methods) are NOT translating errors for those methods.
  // I should check BaseRepository.
  // But for now, since I can't easily see BaseRepository in this turn without a tool call (and I want to save turns),
  // I will check if other repos were overriding methods JUST to add error handling.
  // `MembersRepository` and `OrganizationsRepository` were overriding methods.
  // `ProductsRepository` is NOT overriding them.
  // So I might need to override them OR modify BaseRepository.
  // Modifying BaseRepository seems cleaner if ALL repos use it and we want consistent error handling.
  // But the instructions said "Modified members.repository.ts and organizations.repository.ts".
  // Let's assume I should modify `BaseRepository` if I can, OR override methods here.
  // Given I haven't read BaseRepository, I'll stick to what I know: I can't modify what I haven't read.
  // I will READ BaseRepository effectively in the next turn if needed.
  // But wait, `ProductsRepository` file content shows it ONLY has `buildPrismaClauses`.
  // If I don't override `create`, `update`, etc., they won't have the translation logic if BaseRepository doesn't have it.
  // I will check BaseRepository in the next step. For now I will leave ProductsRepository as is regarding methods, but I will check BaseRepository.

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
