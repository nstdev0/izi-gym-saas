import { IRestoreProductUseCase } from "@/server/application/use-cases/products/restore-product.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class RestoreProductController implements ControllerExecutor<void, void> {
    constructor(private readonly useCase: IRestoreProductUseCase) { }

    async execute(_input: void, id?: string): Promise<void> {
        if (!id) {
            throw new BadRequestError("No se proporcionó un ID");
        }
        await this.useCase.execute(id);
    }
}
