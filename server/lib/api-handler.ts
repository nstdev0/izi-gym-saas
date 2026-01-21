// server/lib/api-handler.ts
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/server/domain/errors/AppError";
import { ZodError } from "zod";

type RouteHandler = (req: NextRequest, params?: any) => Promise<NextResponse>;

export const apiHandler = (handler: RouteHandler): RouteHandler => {
  return async (req: NextRequest, params?: any) => {
    try {
      return await handler(req, params);
    } catch (error: any) {
      // LOGGING INTELIGENTE 🧠
      if (error instanceof AppError && error.isOperational) {
        // Para errores conocidos (400, 404, 409), solo un aviso simple.
        console.warn(`[API WARN] ${error.code}: ${error.message}`);
      } else {
        // Para errores desconocidos o bugs (500), SÍ queremos el stack trace completo.
        console.error(`[API CRITICAL] ${req.method} ${req.url}`, error);
      }

      // ... resto de tu lógica de respuesta (instanceof AppError, ZodError, etc) ...
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
