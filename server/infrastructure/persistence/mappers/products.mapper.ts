import { Product } from "@/server/domain/entities/Product";
import { IMapperInterface } from "./IMapper.interface";
import { Prisma } from "@/generated/prisma/client";

export class ProductMapper implements IMapperInterface<Product, Prisma.ProductUncheckedCreateInput> {
    toDomain(raw: any): Product {
        return new Product(
            raw.id,
            raw.organizationId,
            raw.createdAt,
            raw.updatedAt,
            raw.status,
            raw.deletedAt,
            raw.sku,
            raw.name,
            raw.description,
            raw.price.toNumber(),
            raw.cost.toNumber(),
            raw.stock,
            raw.minStock,
            raw.type,
            raw.isActive,
            raw.images,
        )
    }

    toPersistence(domain: Product): Prisma.ProductUncheckedCreateInput {
        return {
            id: domain.id,
            organizationId: domain.organizationId,
            createdAt: domain.createdAt,
            updatedAt: domain.updatedAt,
            status: domain.status as any,
            deletedAt: domain.deletedAt,
            sku: domain.sku,
            name: domain.name,
            description: domain.description,
            price: domain.price,
            cost: domain.cost,
            stock: domain.stock,
            minStock: domain.minStock,
            type: domain.type,
            isActive: domain.isActive,
            images: domain.images,
        }
    }
}