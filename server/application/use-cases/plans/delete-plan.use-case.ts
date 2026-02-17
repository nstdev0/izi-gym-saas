import { IPlansRepository } from "@/server/application/repositories/plans.repository.interface";

export class DeletePlanUseCase {
  constructor(private readonly repository: IPlansRepository) { }

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
