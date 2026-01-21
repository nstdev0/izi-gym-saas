export interface SerializedError {
  message: string;
  code: string;
  details?: any;
  stack?: string; // Solo en desarrollo
}

export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational: boolean = true;
  readonly details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);

    // FIX: Verificar si la función existe antes de llamarla
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this);
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
