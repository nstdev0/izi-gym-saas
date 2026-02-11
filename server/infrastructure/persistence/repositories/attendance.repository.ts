import {
    IAttendanceRepository,
    AttendanceFilters,
    AttendanceWithMember,
} from "@/server/application/repositories/attendance.repository.interface";
import { RegisterAttendanceInput, UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { Attendance, Prisma, PrismaClient } from "@/generated/prisma/client";
import {
    PageableRequest,
    PageableResponse,
} from "@/server/shared/common/pagination";

export class AttendanceRepository implements IAttendanceRepository {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly organizationId: string,
    ) { }

    async findAll(
        request: PageableRequest<AttendanceFilters> = { page: 1, limit: 10 },
    ): Promise<PageableResponse<AttendanceWithMember>> {
        const { page = 1, limit = 10, filters } = request;

        const safePage = page < 1 ? 1 : page;
        const skip = (safePage - 1) * limit;

        let where: Prisma.AttendanceWhereInput = {};
        let orderBy: Prisma.AttendanceOrderByWithRelationInput = { date: "desc" };

        if (filters) {
            const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
            where = { ...where, ...whereClause };
            orderBy = orderByClause;
        }

        if (this.organizationId) {
            where = { ...where, organizationId: this.organizationId };
        }

        const [totalRecords, records] = await Promise.all([
            this.prisma.attendance.count({ where }),
            this.prisma.attendance.findMany({
                skip,
                take: limit,
                where,
                orderBy,
                include: {
                    member: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            image: true,
                        },
                    },
                },
            }),
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return {
            currentPage: page,
            pageSize: limit,
            totalRecords,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
            records: records as unknown as AttendanceWithMember[],
        };
    }

    async create(data: RegisterAttendanceInput): Promise<Attendance> {
        return this.prisma.attendance.create({
            data: {
                memberId: data.memberId,
                date: data.date,
                method: data.method,
                organizationId: this.organizationId as string,
            },
        });
    }

    async findById(id: string): Promise<AttendanceWithMember | null> {
        const result = await this.prisma.attendance.findFirst({
            where: {
                id,
                organizationId: this.organizationId,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                    },
                },
            },
        });
        return result as unknown as AttendanceWithMember | null;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.attendance.delete({
            where: { id },
        });
    }

    async update(id: string, data: UpdateAttendanceInput): Promise<AttendanceWithMember> {
        const result = await this.prisma.attendance.update({
            where: { id },
            data,
            include: {
                member: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                    },
                },
            },
        });
        return result as unknown as AttendanceWithMember;
    }

    protected async buildPrismaClauses(
        filters: AttendanceFilters,
    ): Promise<[Prisma.AttendanceWhereInput, Prisma.AttendanceOrderByWithRelationInput]> {
        const ALLOWED_SORT_FIELDS = ["date", "createdAt", "method"] as const;

        const conditions: Prisma.AttendanceWhereInput[] = [];

        // Search by member name
        if (filters.search) {
            const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);

            if (searchTerms.length > 0) {
                searchTerms.forEach((term) => {
                    conditions.push({
                        member: {
                            OR: [
                                { firstName: { contains: term, mode: "insensitive" } },
                                { lastName: { contains: term, mode: "insensitive" } },
                            ],
                        },
                    });
                });
            }
        }

        // Filter by method (QR / MANUAL)
        if (filters.method && filters.method !== "all") {
            const methodUpper = filters.method.toUpperCase();
            if (methodUpper === "QR" || methodUpper === "MANUAL") {
                conditions.push({ method: methodUpper as "QR" | "MANUAL" });
            }
        }

        const whereClause: Prisma.AttendanceWhereInput =
            conditions.length > 0 ? { AND: conditions } : {};

        // OrderBy
        let orderByClause: Prisma.AttendanceOrderByWithRelationInput = { date: "desc" };

        if (filters.sort) {
            const [field, direction] = filters.sort.split("-");
            const isValidField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(field);
            const isValidDirection = direction === "asc" || direction === "desc";

            if (isValidField && isValidDirection) {
                orderByClause = { [field]: direction as Prisma.SortOrder };
            }
        }

        return [whereClause, orderByClause];
    }
}
