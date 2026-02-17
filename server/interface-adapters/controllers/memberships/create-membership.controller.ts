import { CreateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { ICreateMembershipUseCase } from "@/server/application/use-cases/memberships/create-membership.use-case";
import { Membership } from "@/server/domain/entities/Membership";
import { ControllerExecutor } from "@/server/lib/api-handler";

export class CreateMembershipController implements ControllerExecutor<CreateMembershipInput, void> {
  constructor(private readonly useCase: ICreateMembershipUseCase) { }

  async execute(input: CreateMembershipInput): Promise<void> {
    await this.useCase.execute(input);
  }
}
