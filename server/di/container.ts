// Probando refactorizacion para dejar de usar controllers y pasar a usar server actions directamente.

import { cache } from "react";
import { MembersRepository } from "@persistence/repositories/members.repository";
import { GetAllMembersUseCase } from "@use-cases/members/get-all-members.use-case";
import { CreateMemberUseCase } from "@use-cases/members/create-member.use-case";
import { GetAllMembersController } from "@controllers/members/get-all-members.controller";
import { CreateMemberController } from "@controllers/members/create-member.controller";
import { prisma } from "../infrastructure/persistence/prisma";

// Factory function "memoizada" por request
export const getContainer = cache(() => {
  const membersRepository = new MembersRepository(prisma.member);

  // Inyección manual (Pure DI)
  const getAllMembersUseCase = new GetAllMembersUseCase(membersRepository);
  const createMemberUseCase = new CreateMemberUseCase(membersRepository);

  // Controllers
  const getAllMembersController = new GetAllMembersController(
    getAllMembersUseCase,
  );
  const createMemberController = new CreateMemberController(
    createMemberUseCase,
  );

  return {
    getAllMembersController,
    createMemberController,
  };
});
