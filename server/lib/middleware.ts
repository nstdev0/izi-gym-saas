// server/lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/server/domain/errors/AppError";
import { ZodError } from "zod";
import { getContainer } from "../di/container";
import { Params } from "next/dist/server/request/params";

type Container = ReturnType<typeof getContainer>;

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

export const createContext = <TInput = NextRequest>(
  selector: ControllerSelector<TInput>,
  requestMapper?: RequestMapper<TInput>,
) => {
  return async (req: NextRequest, context?: { params: Promise<Params> }) => {
    try {
      const params = context?.params ? await context.params : undefined;
      const container = getContainer();
      const controller = selector(container);

      let input: TInput;

      if (requestMapper) {
        input = await requestMapper(req, params);
      } else {
        // Fallback for controllers still expecting (req, params) or just req
        // We assume TInput is structurally compatible if no mapper is provided
        input = req as unknown as TInput;
      }

      const result = await controller.execute(input);

      if (result instanceof NextResponse) {
        return result;
      }

      return NextResponse.json(result, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof AppError && error.isOperational) {
        // Para errores conocidos (400, 404, 409), solo un aviso simple.
        console.warn(`[API WARN] ${error.code}: ${error.message}`);
      } else {
        // Para errores desconocidos o bugs (500), SÍ queremos el stack trace completo.
        console.error(`[API CRITICAL] ${req?.method} ${req?.url}`, error);
      }

      if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.format(),
          },
          { status: 400 },
        );
      }

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
