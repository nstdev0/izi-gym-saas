import { ProductsFilters } from "@/server/domain/types/products";
import { GetAllProductsUseCase } from "@/server/application/use-cases/products/get-all-products.use-case";
import { PageableRequest } from "@/shared/common/pagination";
import { ProductResponseMapper } from "../../mappers/product-response.mapper";

export class GetAllProductsController {
  constructor(private useCase: GetAllProductsUseCase) { }

  async execute(request: PageableRequest<ProductsFilters>) {
    const result = await this.useCase.execute(
      request.filters || {},
      request.page,
      request.limit,
    );
    return {
      ...result,
      records: ProductResponseMapper.toResponseArray(result.records),
    };
  }
}
