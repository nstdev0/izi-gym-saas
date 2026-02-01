import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (container) => container.getPlanByIdController,
  async (req, params) => {
    const p = await params;
    const id = Array.isArray(p?.id) ? p?.id[0] : p?.id;
    if (!id) throw new Error("ID requerido");
    return id;
  },
);

export const PATCH = createContext(
  (container) => container.updatePlanController,
  async (req, params) => {
    const p = params;
    const id = Array.isArray(p?.id) ? p?.id[0] : p?.id;
    if (!id) throw new Error("ID requerido");
    const body = await req.json();
    return { id, data: body }; // Controller expects (id, data), wait, controller execute takes separate args.
    // My createContext implementation assumes Controller.execute takes ONE argument.
    // I need to adjust either the Controller or the CreateContext usage.
    // The previous Members pattern UpdateMemberController.execute(id, data).
    // But createContext calls controller.execute(input).
    // So the input MUST be an object { id, ...data } or wrapped.
  },
);

export const DELETE = createContext(
  (container) => container.deletePlanController,
  async (req, params) => {
    const p = params;
    const id = (Array.isArray(p?.id) ? p?.id[0] : p?.id) as string;
    if (!id) throw new Error("ID requerido");
    return id;
  },
);

// Wait, looking at UpdateMemberController execution in api/members/[id]/route.ts (Wait, I should check that file).
// The user provided api/users/[id]/route.ts before:
// container.updateUserController.execute(id, body) works because it was Manual Dispatch.
// But with createContext, it blindly calls execute(input).
// So UpdatePlanController should take ONE argument if used with createContext?
// OR I wrap it in an adapter?
// Let's stick to the pattern: Controller.execute({ id, ...data }).
// Meaning UpdatePlanController should take ONE argument.
