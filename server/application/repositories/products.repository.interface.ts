import { Product } from "@/server/domain/entities/Product";
import { IBaseRepository } from "./base.repository.interface";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductsFilters,
} from "@/server/domain/types/products";

export type { CreateProductInput, UpdateProductInput, ProductsFilters };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IProductsRepository extends IBaseRepository<
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductsFilters
> {}
