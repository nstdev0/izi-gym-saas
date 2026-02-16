import { AppError } from "./AppError"; // Ajusta la ruta

// 400 Validation Error
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string = "Datos inválidos", details?: any) {
    super(message, details);
  }
}

// 400 Bad Request (Error genérico de negocio)
export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = "BAD_REQUEST";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, details?: any) {
    super(message, details);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";

  constructor(message: string = "No autenticado") {
    super(message);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";

  constructor(message: string = "Acceso denegado") {
    super(message);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";

  constructor(message: string = "Recurso no encontrado") {
    super(message);
  }
}

// 409 Conflict (Ej: Email duplicado)
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, details?: any) {
    super(message, details);
  }
}

// 500 Internal (Opcional, usualmente no se lanza manualmente)
export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";

  constructor(message: string = "Error interno del servidor") {
    super(message);
  }
}