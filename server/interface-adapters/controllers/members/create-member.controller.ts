import { CreateMemberInput } from "@/server/application/dtos/members.dto";
import { ICreateMemberUseCase } from "@/server/application/use-cases/members/create-member.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreateMemberController implements ControllerExecutor<CreateMemberInput, void> {
  constructor(private readonly useCase: ICreateMemberUseCase) { }

  async execute(input: CreateMemberInput): Promise<void> {
    await this.useCase.execute(input);
  }
}