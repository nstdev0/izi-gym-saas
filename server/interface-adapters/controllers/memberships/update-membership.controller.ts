import { UpdateMembershipSchema } from "@/server/application/dtos/memberships.dto";
import { UpdateMembershipUseCase } from "@/server/application/use-cases/memberships/update-membership.use-case";

export class UpdateMembershipController {
  constructor(private readonly useCase: UpdateMembershipUseCase) {}

  async execute({ id, data }: { id: string; data: unknown }) {
    const validatedData = UpdateMembershipSchema.parse(data);
    const membership = await this.useCase.execute(id, validatedData);
    return membership;
  }
}
