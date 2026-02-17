import { Prisma } from "@/generated/prisma/client"
import { ConflictError, InternalError, NotFoundError } from "@/server/domain/errors/common"

export function translatePrismaError(error: unknown, context?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": {
                const fields = (error.meta?.target as string[])?.join(", ") ?? "campo"
                throw new ConflictError(`Ya existe un registro con ese ${fields}`)
            }
            case "P2003":
                throw new ConflictError(
                    "No se puede eliminar porque tiene registros asociados"
                )
            case "P2025":
                throw new NotFoundError(
                    context ? `${context} no encontrado` : "Registro no encontrado"
                )
            case "P2016":
                throw new NotFoundError("Registro relacionado no encontrado")
            default:
                throw new InternalError(
                    `Error de base de datos: ${error.code}`
                )
        }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
        throw new InternalError("Error de validación en la consulta a base de datos")
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
        throw new InternalError("No se pudo conectar a la base de datos")
    }

    // Si no es un error de Prisma conocido, lo relanzamos como InternalError
    throw new InternalError("Error inesperado en la base de datos")
}
