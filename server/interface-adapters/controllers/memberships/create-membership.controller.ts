import { ICreateMembershipUseCase } from "@/server/application/use-cases/memberships/create-membership.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { CreateMembershipInput, MembershipResponse } from "@/shared/types/memberships.types";
import { MembershipResponseMapper } from "../../mappers/membership-response.mapper";

export class CreateMembershipController implements ControllerExecutor<CreateMembershipInput, MembershipResponse> {
  constructor(private readonly useCase: ICreateMembershipUseCase) { }

  async execute(input: CreateMembershipInput): Promise<MembershipResponse> {
    const entity = await this.useCase.execute(input);
    return MembershipResponseMapper.toResponse(entity);
  }
}
