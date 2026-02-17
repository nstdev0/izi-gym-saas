import { z } from "zod";
import { NextRequest } from "next/server";

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export function parsePagination(req: NextRequest) {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    return paginationSchema.parse(params);
}