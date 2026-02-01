import { UpdateProductSchema } from "@/server/application/dtos/products.dto";
import { UpdateProductUseCase } from "@/server/application/use-cases/products/update-product.use-case";

export class UpdateProductController {
  constructor(private readonly useCase: UpdateProductUseCase) {}

  async execute({ id, data }: { id: string; data: unknown }) {
    const validatedData = UpdateProductSchema.parse(data);
    const product = await this.useCase.execute(id, validatedData);
    return product;
  }
}
