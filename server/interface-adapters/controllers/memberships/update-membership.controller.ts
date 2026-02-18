import { UpdateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { UpdateMembershipUseCase } from "@/server/application/use-cases/memberships/update-membership.use-case";
import { BadRequestError } from "@/server/domain/errors/common";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { MembershipResponse } from "@/shared/types/memberships.types";
import { MembershipResponseMapper } from "../../mappers/membership-response.mapper";

export class UpdateMembershipController implements ControllerExecutor<UpdateMembershipInput, MembershipResponse> {
  constructor(private readonly useCase: UpdateMembershipUseCase) { }

  async execute(input: UpdateMembershipInput, id?: string): Promise<MembershipResponse> {
    if (!id) {
      throw new BadRequestError("No se proporcionó un id");
    }
    const entity = await this.useCase.execute(id, input);
    return MembershipResponseMapper.toResponse(entity);
  }
}
