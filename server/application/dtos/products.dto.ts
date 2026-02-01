import { ProductType } from "@/server/domain/entities/Product";
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  cost: z.number().min(0),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(5),
  type: z.enum(ProductType),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).optional(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

export const UpdateProductSchema = createProductSchema.partial();

export type UpdateProductSchema = z.infer<typeof UpdateProductSchema>;
