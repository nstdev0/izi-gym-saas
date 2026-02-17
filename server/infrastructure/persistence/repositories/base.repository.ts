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
    const { page = 1, limit = 10, filters } = request;

    const safePage = page < 1 ? 1 : page
    const skip = (safePage - 1) * limit;

    let where = undefined
    let orderBy = { createdAt: "desc" }

    if (filters) {
      const [whereClause, orderByClause] = await this.buildPrismaClauses(filters);
      where = whereClause
      orderBy = orderByClause
    }

    if (this.organizationId) {
      where = { ...where, organizationId: this.organizationId };
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
  }

  async findUnique(args: Partial<TEntity>): Promise<TEntity | null> {
    const entity = await this.model.findUnique({
      where: {
        ...args,
        organizationId: this.organizationId,
      },
    })
    return entity ? this.mapper.toDomain(entity) : null
  }

  async create(data: TCreate): Promise<TEntity> {
    const entity = await this.model.create({
      data: { ...data, organizationId: this.organizationId } as any,
    })
    return this.mapper.toDomain(entity)
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    const entity = await this.model.update({
      data: { ...data, organizationId: this.organizationId } as any,
      where: { id },
    })
    return this.mapper.toDomain(entity)
  }

  async delete(id: string): Promise<void> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) throw new NotFoundError("Entidad no encontrada");

    await this.model.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<void> {
    const entity = await this.model.findUnique({ where: { id } });
    if (!entity) throw new NotFoundError("Entidad no encontrada");

    await this.model.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    })
  }
}
