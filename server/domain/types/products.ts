export interface CreateProductInput {
  name: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  type: "CONSUMABLE" | "GEAR" | "MERCH" | "SERVICE";
  isActive: boolean;
  images?: string[];
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductsFilters {
  name?: string;
  isActive?: boolean;
  search?: string;
}
