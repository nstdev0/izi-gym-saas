export abstract class AppError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string
  readonly isOperational: boolean = true

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
    }
  }
}