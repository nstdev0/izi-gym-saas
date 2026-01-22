// server/lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/server/domain/errors/AppError";
import { ZodError } from "zod";
import { getContainer } from "../di/container";
import { Params } from "next/dist/server/request/params";

type Container = ReturnType<typeof getContainer>;

type ControllerSelector = (container: Container) => {
  execute: (req?: NextRequest, params?: Params) => Promise<unknown>;
};

export const createApiHandler = (selector: ControllerSelector) => {
  return async (req: NextRequest, params: { params: Params }) => {
    try {
      const container = getContainer();
      const controller = selector(container);
      const result = await controller.execute(await req.json(), params?.params);

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
        console.error(`[API CRITICAL] ${req.method} ${req.url}`, error);
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
