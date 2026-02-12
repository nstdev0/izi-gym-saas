import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/server/domain/errors/AppError";
import { ZodError } from "zod";
import { getContainer } from "../di/container";

// ----------------------------------------------------------------------
// 1. Definición de Tipos Flexibles
// ----------------------------------------------------------------------

type Container = Awaited<ReturnType<typeof getContainer>>;

// El input ahora puede ser cualquier cosa o 'void' (vacío)
export type ControllerExecutor<TInput = void, TResult = unknown> = {
  // El ID es opcional siempre, el Input depende del genérico
  execute: (input: TInput, id?: string) => Promise<TResult>;
};

// Selector: Recibe contenedor, devuelve el controlador tipado
type ControllerSelector<TInput, TResult> = (
  container: Container
) => ControllerExecutor<TInput, TResult>;

// Mapper: Ahora recibe los params resueltos explícitamente
type RequestMapper<TInput> = (
  req: NextRequest,
  params?: Record<string, string | string[]> // Params ya resueltos
) => TInput | Promise<TInput>;

// Opciones extendidas
type ContextOptions = {
  isPublic?: boolean;
  paramKey?: string; // Opcional: por si la ruta es [slug] en vez de [id]
};

// ----------------------------------------------------------------------
// 2. Implementación del Handler (Factory)
// ----------------------------------------------------------------------

export const createContext = <TInput = void, TResult = unknown>(
  selector: ControllerSelector<TInput, TResult>,
  requestMapper?: RequestMapper<TInput>,
  options: ContextOptions = { isPublic: false, paramKey: "id" }
) => {
  // Retornamos la firma estándar de Next.js Route Handler
  return async (
    req: NextRequest,
    // Next.js 15: props.params es una Promesa
    props: { params: Promise<Record<string, string | string[]>> }
  ) => {
    try {
      // A. Auth Guard
      const session = await auth();

      if (!options.isPublic) {
        if (!session.userId) {
          return NextResponse.json(
            { message: "No autenticado", code: "UNAUTHORIZED" },
            { status: 401 }
          );
        }
        // Opcional: Validar orgId si es estricto para tu app
        // if (!session.orgId) { ... }
      }

      // B. Resolución de Params (Next 15)
      // Esperamos la promesa de params una sola vez
      const resolvedParams = props?.params ? await props.params : {};

      // Extraemos el ID basado en la configuración (default: "id")
      const idParam = resolvedParams[options.paramKey || "id"];
      const id = typeof idParam === "string" ? idParam : undefined;

      // C. Construcción del Input (DTO)
      let input: TInput;

      if (requestMapper) {
        // Caso 1: Hay Mapper -> Lo ejecutamos (POST, PUT complex)
        input = await requestMapper(req, resolvedParams);
      } else {
        // Caso 2: No hay Mapper -> Asumimos undefined (GET, DELETE simples)
        // El 'as TInput' aquí permite que sea void/undefined sin que TS se queje
        input = undefined as unknown as TInput;
      }

      // D. Inyección de Dependencias
      const container = await getContainer();
      const controller = selector(container);

      // E. Ejecución del Controlador
      // Aquí ocurre la magia: pasamos input (que puede ser undefined) y el id (que puede ser undefined)
      const result = await controller.execute(input, id);

      // F. Respuesta
      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result, { status: 200 });

    } catch (error: unknown) {
      // ------------------------------------------------------
      // Manejo de Errores Centralizado
      // ------------------------------------------------------

      // 1. AppError (Lógica de Negocio)
      if (error instanceof AppError) {
        if (!error.isOperational) {
          console.error(`[APP ERROR]`, error);
        }
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }

      // 2. ZodError (Validación de Input)
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join(".") || "_root";
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }

        return NextResponse.json(
          {
            message: "Datos inválidos",
            code: "VALIDATION_ERROR",
            errors: fieldErrors,
          },
          { status: 400 }
        );
      }

      // 3. Error No Controlado (Crash) pero verificando si es Prisma
      // @ts-expect-error: Handling Prisma error code dynamically
      if (error?.code === 'P2003') {
        return NextResponse.json(
          {
            message: "No se puede eliminar porque tiene registros asociados (membresías, pagos, etc).",
            code: "CONFLICT_ERROR",
          },
          { status: 409 }
        );
      }

      console.error(`[API CRITICAL] ${req.method} ${req.url}`, error);

      return NextResponse.json(
        {
          message: "Error interno del servidor",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  };
};