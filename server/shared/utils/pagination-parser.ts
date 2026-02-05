import { z } from "zod";
import { NextRequest } from "next/server";

// Esquema base reutilizable
const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

export function parsePagination(req: NextRequest) {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    // Devuelve { page: number, limit: number } seguros
    return paginationSchema.parse(params);
}