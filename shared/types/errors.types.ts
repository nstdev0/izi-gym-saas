export type AppErrorResponse = {
    message: string;
    code: AppErrorCode;
    fields?: Record<string, string[]>;
    timestamp?: string; // Optional, strict for logs
    path?: string;      // Optional, strict for logs
};

export type AppErrorCode =
    | "NOT_FOUND"
    | "CONFLICT"
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "VALIDATION_ERROR"
    | "EXTERNAL_SERVICE_ERROR"
    | "INTERNAL_SERVER_ERROR"
    | "CONFLICT_ERROR"; // From api-handler.ts (Prisma errors)
