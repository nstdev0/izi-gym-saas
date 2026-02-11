import { UpdateMemberSchema } from "@/server/application/dtos/members.dto";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getMemberByIdController
);

export const PATCH = createContext(
  (c) => c.updateMemberController,
  async (req) => {
    const body = await req.json();
    return UpdateMemberSchema.parse(body);
  }
);

export const DELETE = createContext(
  (c) => c.deleteMemberController
);