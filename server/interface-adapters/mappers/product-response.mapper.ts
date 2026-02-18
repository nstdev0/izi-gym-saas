import { Product } from "@/server/domain/entities/Product";
import { ProductResponse } from "@/shared/types/products.types";

export class ProductResponseMapper {
    static toResponse(entity: Product): ProductResponse {
        return {
            id: entity.id,
            organizationId: entity.organizationId,
            sku: entity.sku,
            name: entity.name,
            description: entity.description,
            price: entity.price,
            cost: entity.cost,
            stock: entity.stock,
            minStock: entity.minStock,
            type: entity.type,
            isActive: entity.isActive,
            images: entity.images,
            isLowStock: entity.isLowStock,
            profitMargin: entity.profitMargin,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            deletedAt: entity.deletedAt?.toISOString() ?? null,
        };
    }

    static toResponseArray(entities: Product[]): ProductResponse[] {
        return entities.map(this.toResponse);
    }
}
