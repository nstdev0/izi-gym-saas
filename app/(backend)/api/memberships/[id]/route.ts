import { UpdateMembershipSchema } from "@/shared/types/memberships.types";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getMembershipByIdController
);

export const PATCH = createContext(
  (c) => c.updateMembershipController,
  async (req) => {
    const body = await req.json();
    return UpdateMembershipSchema.parse(body);
  }
);

export const DELETE = createContext(
  (c) => c.deleteMembershipController
);
