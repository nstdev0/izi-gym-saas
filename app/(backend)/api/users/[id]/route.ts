import { UpdateUserSchema } from "@/shared/types/users.types";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getUserByIdController,
);

export const PATCH = createContext(
  (c) => c.updateUserController,
  async (req) => {
    const body = await req.json();
    return UpdateUserSchema.parse(body);
  }
);

export const DELETE = createContext(
  (c) => c.deleteUserController
);