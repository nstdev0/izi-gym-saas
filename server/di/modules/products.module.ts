import { ProductsRepository } from "@/server/infrastructure/persistence/repositories/products.repository";
import { GetAllProductsUseCase } from "@/server/application/use-cases/products/get-all-products.use-case";
import { CreateProductUseCase } from "@/server/application/use-cases/products/create-product.use-case";
import { GetProductByIdUseCase } from "@/server/application/use-cases/products/get-product-by-id.use-case";
import { UpdateProductUseCase } from "@/server/application/use-cases/products/update-product.use-case";
import { DeleteProductUseCase } from "@/server/application/use-cases/products/delete-product.use-case";
import { RestoreProductUseCase } from "@/server/application/use-cases/products/restore-product.use-case";

import { GetAllProductsController } from "@/server/interface-adapters/controllers/products/get-all-products.controller";
import { CreateProductController } from "@/server/interface-adapters/controllers/products/create-product.controller";
import { GetProductByIdController } from "@/server/interface-adapters/controllers/products/get-product-by-id.controller";
import { UpdateProductController } from "@/server/interface-adapters/controllers/products/update-product.controller";
import { DeleteProductController } from "@/server/interface-adapters/controllers/products/delete-product.controller";
import { RestoreProductController } from "@/server/interface-adapters/controllers/products/restore-product.controller";
import { PrismaClient } from "@/generated/prisma/client";

export function createProductsModule(prisma: PrismaClient, tenantId: string) {
    const productsRepository = new ProductsRepository(prisma.product, tenantId);

    const getAllProductsUseCase = new GetAllProductsUseCase(productsRepository);
    const createProductUseCase = new CreateProductUseCase(productsRepository);
    const getProductByIdUseCase = new GetProductByIdUseCase(productsRepository);
    const updateProductUseCase = new UpdateProductUseCase(productsRepository);
    const deleteProductUseCase = new DeleteProductUseCase(productsRepository);
    const restoreProductUseCase = new RestoreProductUseCase(productsRepository);

    const getAllProductsController = new GetAllProductsController(
        getAllProductsUseCase,
    );
    const createProductController = new CreateProductController(
        createProductUseCase,
    );
    const getProductByIdController = new GetProductByIdController(
        getProductByIdUseCase,
    );
    const updateProductController = new UpdateProductController(
        updateProductUseCase,
    );
    const deleteProductController = new DeleteProductController(
        deleteProductUseCase,
    );
    const restoreProductController = new RestoreProductController(
        restoreProductUseCase,
    );

    return {
        getAllProductsController,
        createProductController,
        getProductByIdController,
        updateProductController,
        deleteProductController,
        restoreProductController,
    };
}
