import { AppError } from "./AppError"

export class NotFoundError extends AppError {
  readonly statusCode = 404
  readonly code = "NOT_FOUND"
}

export class ConflictError extends AppError {
  readonly statusCode = 409
  readonly code = "CONFLICT"
}

export class BadRequestError extends AppError {
  readonly statusCode = 400
  readonly code = "BAD_REQUEST"
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401
  readonly code = "UNAUTHORIZED"
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403
  readonly code = "FORBIDDEN"
}

export class ValidationError extends AppError {
  readonly statusCode = 422
  readonly code = "VALIDATION_ERROR"
  readonly fields?: Record<string, string[]>

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message)
    this.fields = fields
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.fields && { fields: this.fields }),
    }
  }
}

export class ExternalServiceError extends AppError {
  readonly statusCode = 502
  readonly code = "EXTERNAL_SERVICE_ERROR"
  readonly isOperational = false
}

export class InternalError extends AppError {
  readonly statusCode = 500
  readonly code = "INTERNAL_SERVER_ERROR"
  readonly isOperational = false
}