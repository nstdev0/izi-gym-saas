import { GetMembershipByIdUseCase } from "@/server/application/use-cases/memberships/get-membership-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { Membership } from "@/shared/types/memberships.types";

export class GetMembershipByIdController implements ControllerExecutor<void, Membership | null> {
  constructor(private readonly useCase: GetMembershipByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<Membership | null> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const membership = await this.useCase.execute(id);
    if (!membership) {
      throw new NotFoundError("Membresía no encontrada");
    }
    return membership;
  }
}
