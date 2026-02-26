import { BaseRepository } from "./base.repository";
import {
    IAttendanceRepository,
} from "@/server/application/repositories/attendance.repository.interface";
import { AttendanceFilters, RegisterAttendanceInput, UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { Prisma } from "@/generated/prisma/client";
import {
    PageableRequest,
    PageableResponse,
} from "@/shared/types/pagination.types";
import { AttendanceMapper } from "../mappers/attendance.mapper";
import { translatePrismaError } from "../prisma-error-translator";
import { Attendance } from "@/server/domain/entities/Attendance";

export class AttendanceRepository
    extends BaseRepository<
        Prisma.AttendanceDelegate,
        Attendance,
        RegisterAttendanceInput,
        UpdateAttendanceInput,
        AttendanceFilters
    >
    implements IAttendanceRepository {

    constructor(
        model: Prisma.AttendanceDelegate,
        organizationId: string,
    ) {
        super(model, new AttendanceMapper(), organizationId, "Asistencia");
    }

    async findAll(
        request: PageableRequest<AttendanceFilters> = { page: 1, limit: 10 },
    ): Promise<PageableResponse<Attendance>> {
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

        try {
            const [totalRecords, records] = await Promise.all([
                this.model.count({ where }),
                this.model.findMany({
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
                                docType: true,
                                docNumber: true,
                            },
                        },
                    },
                }),
            ]);

            const totalPages = Math.ceil(totalRecords / limit);
            const mappedRecords = records.map(record => this.mapper.toDomain(record));

            return {
                currentPage: page,
                pageSize: limit,
                totalRecords,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
                records: mappedRecords,
            };
        } catch (error) {
            translatePrismaError(error, "Asistencias")
        }
    }

    async create(data: RegisterAttendanceInput): Promise<Attendance> {
        try {
            const record = await this.model.create({
                data: {
                    memberId: data.memberId,
                    date: data.date,
                    method: data.method,
                    organizationId: this.organizationId as string,
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
            return this.mapper.toDomain(record);
        } catch (error) {
            translatePrismaError(error, "Asistencia")
        }
    }

    async findById(id: string): Promise<Attendance | null> {
        try {
            const record = await this.model.findFirst({
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
            if (!record) return null;
            return this.mapper.toDomain(record);
        } catch (error) {
            translatePrismaError(error, "Asistencia")
        }
    }

    async update(id: string, data: UpdateAttendanceInput): Promise<Attendance> {
        try {
            const record = await this.model.update({
                where: { id, organizationId: this.organizationId },
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
            return this.mapper.toDomain(record);
        } catch (error) {
            translatePrismaError(error, "Asistencia")
        }
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
                searchTerms.forEach((term: string) => {
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
        if (filters.method) {
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
