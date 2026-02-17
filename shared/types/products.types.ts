import { BaseEntity } from "./common.types";
import { z } from "zod";

export enum ProductType {
    CONSUMABLE = "CONSUMABLE",
    GEAR = "GEAR",
    MERCH = "MERCH",
    SERVICE = "SERVICE",
}

export interface Product extends BaseEntity {
    sku: string | null;
    name: string;
    description: string | null;
    price: number;
    cost: number;
    stock: number;
    minStock: number;
    type: ProductType;
    isActive: boolean;
    images: string[];
    // Getters are not included in interface
}

export const createProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0),
    cost: z.number().min(0),
    stock: z.number().int().min(0).default(0),
    minStock: z.number().int().min(0).default(5),
    type: z.nativeEnum(ProductType),
    isActive: z.boolean().default(true),
    images: z.array(z.string()).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const UpdateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export interface ProductsFilters {
    search?: string;
    sort?: string;
    type?: string;
    status?: string;
    isActive?: boolean;
}
