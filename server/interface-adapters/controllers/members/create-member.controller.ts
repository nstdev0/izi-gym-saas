import { CreateMemberInput } from "@/server/application/dtos/members.dto";
import { ICreateMemberUseCase } from "@/server/application/use-cases/members/create-member.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { MemberResponse } from "@/shared/types/members.types";
import { MemberResponseMapper } from "../../mappers/member-response.mapper";

export class CreateMemberController implements ControllerExecutor<CreateMemberInput, MemberResponse> {
  constructor(private readonly useCase: ICreateMemberUseCase) { }

  async execute(input: CreateMemberInput): Promise<MemberResponse> {
    const entity = await this.useCase.execute(input);
    return MemberResponseMapper.toResponse(entity);
  }
}