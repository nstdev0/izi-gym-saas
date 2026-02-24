import { IProductsRepository } from "@/server/application/repositories/products.repository.interface";
import { Product } from "@/server/domain/entities/Product";
import { NotFoundError } from "@/server/domain/errors/common";
import { IPermissionService } from "@/server/application/services/permission.service.interface";

export interface IRestoreProductUseCase {
    execute(id: string): Promise<Product | null>;
}

export class RestoreProductUseCase implements IRestoreProductUseCase {
    constructor(
        private readonly repo: IProductsRepository,
        private readonly permissions: IPermissionService
    ) { }

    async execute(id: string): Promise<Product | null> {
        this.permissions.require('products:delete');
        const product = await this.repo.findUnique({ id });

        if (!product) throw new NotFoundError("Producto no encontrado");

        await this.repo.restore(id);

        return await this.repo.findUnique({ id } as any);
    }
}
