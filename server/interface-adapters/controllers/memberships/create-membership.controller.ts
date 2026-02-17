import { ICreateMembershipUseCase } from "@/server/application/use-cases/memberships/create-membership.use-case";
import { ControllerExecutor } from "@/server/lib/api-handler";
import { CreateMembershipInput } from "@/shared/types/memberships.types";

export class CreateMembershipController implements ControllerExecutor<CreateMembershipInput, void> {
  constructor(private readonly useCase: ICreateMembershipUseCase) { }

  async execute(input: CreateMembershipInput): Promise<void> {
    await this.useCase.execute(input);
  }
}
