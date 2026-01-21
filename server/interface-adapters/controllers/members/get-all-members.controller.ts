import { IGetAllMembersUseCase } from "@use-cases/members/get-all-members.use-case";

export class GetAllMembersController {
  constructor(private readonly getAllMembersUseCase: IGetAllMembersUseCase) {}

  async execute() {
    try {
      return await this.getAllMembersUseCase.execute();
    } catch (error) {
      console.error("[GetAllMembersController]:", error);
      throw error;
    }
  }
}
