import { UpdateOrganizationSchema } from "@/shared/types/organizations.types";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getOrganizationByIdController
);

export const PATCH = createContext(
  (c) => c.updateOrganizationController,
  async (req) => {
    const body = await req.json();
    return UpdateOrganizationSchema.parse(body);
  }
);

export const DELETE = createContext(
  (c) => c.deleteOrganizationController
);
