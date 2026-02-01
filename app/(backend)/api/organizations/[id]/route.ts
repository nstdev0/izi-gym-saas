import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (container) => container.getOrganizationByIdController,
  async (req, params) => {
    const p = await params;
    const id = Array.isArray(p?.id) ? p?.id[0] : p?.id;
    if (!id) throw new Error("ID requerido");
    return id;
  },
);

export const PATCH = createContext(
  (container) => container.updateOrganizationController,
  async (req, params) => {
    const p = params;
    const id = Array.isArray(p?.id) ? p?.id[0] : p?.id;
    if (!id) throw new Error("ID requerido");
    const body = await req.json();
    return { id, data: body };
  },
);

export const DELETE = createContext(
  (container) => container.deleteOrganizationController,
  async (req, params) => {
    const p = params;
    const id = (Array.isArray(p?.id) ? p?.id[0] : p?.id) as string;
    if (!id) throw new Error("ID requerido");
    return id;
  },
);
