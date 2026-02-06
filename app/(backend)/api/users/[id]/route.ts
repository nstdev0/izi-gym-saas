import { UpdateUserSchema } from "@/server/application/dtos/users.dto";
import { createContext } from "@/server/lib/api-handler";

export const GET = createContext(
  (c) => c.getUserByIdController,
);

// PATCH: Actualizar usuario
// Usamos el mapper para extraer y validar el body
export const PATCH = createContext(
  (c) => c.updateUserController,
  async (req) => {
    const body = await req.json();
    // Es buena práctica validar aquí con Zod antes de pasar al controller
    // Si no tienes schema, puedes devolver body directo: return body;
    return UpdateUserSchema.parse(body);
  }
);

// DELETE: Eliminar usuario
// No requiere mapper (input void), solo el ID
export const DELETE = createContext(
  (c) => c.deleteUserController
);