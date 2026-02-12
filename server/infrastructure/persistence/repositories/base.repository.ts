// Placeholder to avoid empty replacement error while I verify pagination file location
// I will check the file location first in next step.
import {
  IBaseRepository,
  PrismaDelegate,
} from "@/server/application/repositories/base.repository.interface";
import {
  PageableRequest,
  PageableResponse,
} from "@/server/shared/common/pagination";

export abstract class BaseRepository<
  D extends PrismaDelegate,
  TEntity,
  TCreate,
  TUpdate,
  TFilters = unknown,
> implements IBaseRepository<TEntity, TCreate, TUpdate, TFilters> {
  constructor(
    protected readonly model: D,
    protected readonly organizationId?: string,
  ) { }

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

    return {
      currentPage: page,
      pageSize: limit,
      totalRecords,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      records: records as TEntity[],
    };
  }

  async findUnique(args: Partial<TEntity>): Promise<TEntity | null> {
    return (await this.model.findUnique({
      where: {
        ...args,
        organizationId: this.organizationId,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as TEntity | null;
  }

  async create(data: TCreate): Promise<TEntity> {
    return (await this.model.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...data, organizationId: this.organizationId } as any,
    })) as TEntity;
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    return (await this.model.update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...data, organizationId: this.organizationId } as any,
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as TEntity;
  }

  async delete(id: string): Promise<TEntity> {
    return (await this.model.delete({
      where: { id, organizationId: this.organizationId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as TEntity;
  }
}
