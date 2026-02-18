import { GetMembershipByIdUseCase } from "@/server/application/use-cases/memberships/get-membership-by-id.use-case";
import { BadRequestError, NotFoundError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { MembershipResponse } from "@/shared/types/memberships.types";
import { MembershipResponseMapper } from "../../mappers/membership-response.mapper";

export class GetMembershipByIdController implements ControllerExecutor<void, MembershipResponse> {
  constructor(private readonly useCase: GetMembershipByIdUseCase) { }

  async execute(_input: void, id?: string): Promise<MembershipResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const membership = await this.useCase.execute(id);
    if (!membership) {
      throw new NotFoundError("Membresía no encontrada");
    }
    return MembershipResponseMapper.toResponse(membership);
  }
}
