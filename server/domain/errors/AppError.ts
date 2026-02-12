export interface SerializedError {
  message: string;
  code: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  stack?: string;
}

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational: boolean = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly details?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, details?: any) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      // ✅ MEJORA: Pasamos 'this.constructor' para excluir esta clase del stack
      // y que el error apunte a la línea exacta donde se lanzó (ej: en el UseCase).
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): SerializedError {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    };
  }
}