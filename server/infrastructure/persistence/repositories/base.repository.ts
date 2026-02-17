import {
  IBaseRepository,
  PrismaDelegate,
} from "@/server/application/repositories/base.repository.interface";
import { NotFoundError } from "@/server/domain/errors/common";
import {
  PageableRequest,
  PageableResponse,
} from "@/shared/common/pagination";
import { IMapperInterface } from "../mappers/IMapper.interface";
import { translatePrismaError } from "../prisma-error-translator";

export abstract class BaseRepository<
  D extends PrismaDelegate,
  TEntity,
  TCreate,
  TUpdate,
  TFilters = unknown,
> implements IBaseRepository<TEntity, TCreate, TUpdate, TFilters> {
  constructor(
    protected readonly model: D,
    protected readonly mapper: IMapperInterface<TEntity, any>,
    protected readonly organizationId?: string,
    protected readonly entityName: string = "Entidad",
  ) { }

  protected restoreField = (value: string | null | undefined): string | null => {
    if (!value) return null;
    return value.replace(/^deletedAt_\d+_/, '');
  };

  protected softDelete = (value: string | null | undefined): string | null => {
    if (!value) return null;
    return `deletedAt_${Date.now()}_${value}`;
  }

  protected abstract buildPrismaClauses(
    filters: TFilters,
    // ): Promise<[Parameters<D["findMany"]>[0]["where"], Parameters<D["findMany"]>[0]["orderBy"]]>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<[any, any]>;

  async findAll(
    request: PageableRequest<TFilters> = { page: 1, limit: 10 },
  ): Promise<PageableResponse<TEntity>> {
    try {
      const { page = 1, limit = 10, filters } = request;

      const safePage = page < 1 ? 1 : page
      const skip = (safePage - 1) * limit;

      let where: any = { deletedAt: null }
      let orderBy: any = { createdAt: "desc" }

      if (this.organizationId) {
        where.organizationId = this.organizationId;
      }

      if (filters) {
        const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
        where = { ...where, ...whereClause }

        if (orderByClause) orderBy = orderByClause
      }

      const [totalRecords, records] = await Promise.all([
        this.model.count({ where }),
        this.model.findMany({
          skip,
          take: limit,
          where,
          orderBy: orderBy,
        }),
      ]);

      const totalPages = Math.ceil(totalRecords / limit);

      const mappedRecords = records.map((record) => this.mapper.toDomain(record));

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
      translatePrismaError(error, this.entityName)
    }
  }

  async findById(id: string): Promise<TEntity | null> {
    try {
      const entity = await this.model.findUnique({
        where: { id },
      })
      return entity ? this.mapper.toDomain(entity) : null
    } catch (error) {
      translatePrismaError(error, this.entityName)
    }
  }

  async findUnique(args: Partial<TEntity>): Promise<TEntity | null> {
    try {
      const entity = await this.model.findUnique({
        where: {
          ...args,
          organizationId: this.organizationId,
        },
      })
      return entity ? this.mapper.toDomain(entity) : null
    } catch (error) {
      translatePrismaError(error, this.entityName)
    }
  }

  async create(data: TCreate): Promise<TEntity> {
    try {
      const entity = await this.model.create({
        data: { ...data, organizationId: this.organizationId } as any,
      })
      return this.mapper.toDomain(entity)
    } catch (error) {
      translatePrismaError(error, this.entityName)
    }
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    try {
      const entity = await this.model.update({
        data: { ...data, organizationId: this.organizationId } as any,
        where: { id },
      })
      return this.mapper.toDomain(entity)
    } catch (error) {
      translatePrismaError(error, this.entityName)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const entity = await this.model.findUnique({ where: { id } });
      if (!entity) throw new NotFoundError("Entidad no encontrada");

      await this.model.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      translatePrismaError(error, this.entityName)
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const entity = await this.model.findUnique({ where: { id } });
      if (!entity) throw new NotFoundError("Entidad no encontrada");

      await this.model.update({
        where: { id },
        data: {
          isActive: true,
          deletedAt: null,
        },
      })
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      translatePrismaError(error, this.entityName)
    }
  }
}
