import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/server/domain/errors/AppError";
import { ZodError } from "zod";
import { getContainer } from "../di/container";
import { Params } from "next/dist/server/request/params";

// Nota: Asumimos que getContainer ahora es async para leer la sesión
type Container = Awaited<ReturnType<typeof getContainer>>;

type ControllerExecutor<TInput> = {
  execute: (input: TInput) => Promise<unknown>;
};

type ControllerSelector<TInput> = (
  container: Container,
) => ControllerExecutor<TInput>;

type RequestMapper<TInput> = (
  req: NextRequest,
  params?: Params,
) => TInput | Promise<TInput>;

// Opciones extra para flexibilizar el middleware
type ContextOptions = {
  isPublic?: boolean; // Por si alguna ruta no requiere login
};

export const createContext = <TInput = NextRequest>(
  selector: ControllerSelector<TInput>,
  requestMapper?: RequestMapper<TInput>,
  options: ContextOptions = { isPublic: false },
) => {
  return async (req: NextRequest, context?: { params: Promise<Params> }) => {
    try {
      // --- 2. INTEGRACIÓN CLERK (Security Gatekeeper) ---
      const session = await auth();

      // Si la ruta NO es pública y falta usuario u organización...
      if (!options.isPublic) {
        if (!session.userId) {
          return NextResponse.json(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        // Regla SaaS: Si no tiene Org seleccionada, no puede operar
        if (!session.orgId) {
          return NextResponse.json(
            {
              message: "Organization context required",
              code: "NO_ORG_SELECTED",
            },
            { status: 403 },
          );
        }
      }

      // --- 3. Inyección de Dependencias (Scoped) ---
      const params = context?.params ? await context.params : undefined;

      // Hacemos await porque el container necesita leer la sesión asíncronamente
      const container = await getContainer();
      const controller = selector(container);

      let input: TInput;

      if (requestMapper) {
        input = await requestMapper(req, params);
      } else {
        input = req as unknown as TInput;
      }

      const result = await controller.execute(input);

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
      // --- 4. Manejo de Errores Mejorado ---

      if (error instanceof AppError && error.isOperational) {
        console.warn(`[API WARN] ${error.code}: ${error.message}`);
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            errors: error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }

      // // Errores específicos de Clerk (opcional, si usas sus SDKs de gestión)
      // if ((error as any).clerkError) {
      //   return NextResponse.json(
      //     { message: "Authentication Error", code: "AUTH_ERROR" },
      //     { status: 401 },
      //   );
      // }

      console.error(`[API CRITICAL] ${req?.method} ${req?.url}`, error);

      return NextResponse.json(
        {
          message: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 },
      );
    }
  };
};
