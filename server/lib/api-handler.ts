// server/lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/server/domain/errors/AppError";
import z, { ZodError } from "zod";
import { getContainer } from "../di/container";
import { Params } from "next/dist/server/request/params";

// Tipado del Contenedor (Dependency Injection)
type Container = Awaited<ReturnType<typeof getContainer>>;

// Definición de un Ejecutor de Controlador (Command Pattern)
type ControllerExecutor<TInput> = {
  execute: (input: TInput) => Promise<unknown>;
};

// Función selectora para sacar el controlador del contenedor
type ControllerSelector<TInput> = (
  container: Container,
) => ControllerExecutor<TInput>;

// Mapper para transformar Request -> DTO
type RequestMapper<TInput> = (
  req: NextRequest,
  params?: any // Flexibilizamos esto ya que 'params' en Next 15 es Promise<any> resuelto
) => TInput | Promise<TInput>;

type ContextOptions = {
  isPublic?: boolean;
};

export const createContext = <TInput = NextRequest>(
  selector: ControllerSelector<TInput>,
  requestMapper?: RequestMapper<TInput>,
  options: ContextOptions = { isPublic: false },
) => {
  // Retornamos la firma estándar de Next.js Route Handler
  return async (
    req: NextRequest,
    // Next.js 15: props.params es una Promesa
    props: { params: Promise<Params> }
  ) => {
    try {
      // 1. Auth & Context Gatekeeper
      const session = await auth();

      if (!options.isPublic) {
        if (!session.userId) {
          return NextResponse.json(
            { message: "No autenticado", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }
        if (!session.orgId) {
          return NextResponse.json(
            { message: "Contexto de organización requerido", code: "NO_ORG_SELECTED" },
            { status: 403 },
          );
        }
      }

      // 2. Dependency Injection
      const container = await getContainer();
      const controller = selector(container);

      // 3. Request Mapping (DTO)
      let input: TInput;

      // Resolvemos params si existen (Next 15 safe)
      const resolvedParams = props?.params ? await props.params : undefined;

      if (requestMapper) {
        input = await requestMapper(req, resolvedParams);
      } else {
        // Si no hay mapper, pasamos la Request cruda (útil para casos simples)
        input = req as unknown as TInput;
      }

      // 4. Execution
      const result = await controller.execute(input);

      // Si el controlador devuelve ya una NextResponse (ej: redirect o file download), la dejamos pasar
      if (result instanceof NextResponse) {
        return result;
      }

      // Si devuelve datos planos, los envolvemos en JSON 200 OK
      return NextResponse.json(result, { status: 200 });

    } catch (error: unknown) {
      // --- Error Handling Centralizado ---

      // A. Errores de Negocio Controlados (AppError)
      if (error instanceof AppError) {
        // Solo logueamos warnings si no son operativos (bugs)
        if (!error.isOperational) {
          console.error(`[APP ERROR]`, error);
        }
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }

      // B. Errores de Validación (Zod)
      // Robustez: Comprobamos instanceof O si parece un error de Zod por nombre/propiedades
      // Esto previene fallos si hay versiones mezcladas de npm
      // const isZodError =
      //   error instanceof ZodError ||
      //   (error instanceof Error && error.name === "ZodError") ||
      //   (typeof error === "object" && error !== null && "issues" in error);

      // if (isZodError) {
      //   // Si no es instancia pero parece Zod, lo casteamos a any para acceder a flatten
      //   const zodErr = error as ZodError;
      //   // Nota: si no es instancia real puede que flatten no exista, usamos issues directo si falla
      //   const fieldErrors = typeof zodErr.flatten === 'function'
      //     ? z.treeifyError(zodErr).errors
      //     : zodErr.issues; // Fallback simple

      //   console.log("[API HANDLER] Caught ZodError:", fieldErrors);

      //   return NextResponse.json(
      //     {
      //       message: "Datos inválidos",
      //       code: "VALIDATION_ERROR",
      //       errors: fieldErrors,
      //     },
      //     { status: 400 },
      //   );
      // }

      if (error instanceof ZodError) {
        // Zod v3: Transformamos el array de issues a un objeto { campo: [mensajes] }
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join(".") || "_root";
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }
        console.log("[API HANDLER] Caught ZodError:", fieldErrors);

        return NextResponse.json(
          {
            message: "Datos inválidos",
            code: "VALIDATION_ERROR",
            errors: fieldErrors,
          },
          { status: 400 },
        );
      }

      // C. Errores Desconocidos (Crash)
      console.error(`[API CRITICAL] ${req.method} ${req.url}`, error);

      return NextResponse.json(
        {
          message: "Error interno del servidor",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 },
      );
    }
  };
};