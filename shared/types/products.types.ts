import { BaseEntity, BaseResponse } from "./common.types";
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

export interface ProductResponse extends BaseResponse {
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
    isLowStock: boolean;
    profitMargin: number;
}

export const createProductSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    sku: z.string().optional(),
    description: z.string().optional(),
    price: z.number({
        required_error: "El precio es requerido",
    }).min(0, "El precio debe ser mayor a 0"),
    cost: z.number({
        required_error: "El costo es requerido",
    }).min(0, "El costo debe ser mayor a 0"),
    stock: z.number({
        required_error: "El stock es requerido",
    }).int().min(0, "El stock debe ser mayor a 0"),
    minStock: z.number({
        required_error: "El stock mínimo es requerido",
    }).int().min(0).default(5),
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
