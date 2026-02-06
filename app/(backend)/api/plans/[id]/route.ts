import { UpdatePlanSchema } from "@/server/application/dtos/plans.dto";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getPlanByIdController
);

export const PATCH = createContext(
  (c) => c.updatePlanController,
  async (req) => {
    const body = await req.json();
    return UpdatePlanSchema.parse(body);
  }
);

export const DELETE = createContext(
  (c) => c.deletePlanController
);
