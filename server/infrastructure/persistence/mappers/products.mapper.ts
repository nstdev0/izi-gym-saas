import { Product } from "@/server/domain/entities/Product";
import { IMapperInterface } from "./IMapper.interface";

export class ProductMapper implements IMapperInterface<Product> {
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
}