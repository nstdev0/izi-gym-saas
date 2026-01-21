// src/domain/errors/common.ts
import { AppError } from "./AppError";

// 400 - Bad Request (Validación general)
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";

  constructor(message: string = "Validation failed", details?: any) {
    super(message, details);
  }
}

// 404 - Not Found
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "RESOURCE_NOT_FOUND";
}

// 409 - Conflict (Ej: Email duplicado)
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "RESOURCE_CONFLICT";
}

// 401 - Unauthorized (No logueado)
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

// 403 - Forbidden (Logueado pero sin permisos)
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

// 500 - Internal (Para wrappear errores raros si es necesario)
export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";
  readonly isOperational = false; // Esto fue inesperado
}
