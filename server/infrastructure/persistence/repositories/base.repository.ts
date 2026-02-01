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
  ) {}

  protected abstract buildQueryFilters(
    filters: TFilters,
  ): Promise<Parameters<D["findMany"]>[0]["where"]>;

  async findAll(
    request: PageableRequest<TFilters> = { page: 1, limit: 10 },
    options?: {
      orderBy?: Parameters<D["findMany"]>[0]["orderBy"];
      include?: Parameters<D["findMany"]>[0]["include"];
    },
  ): Promise<PageableResponse<TEntity>> {
    const { page, limit, filters } = request;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (filters) {
      const dynamicFilters = await this.buildQueryFilters(filters);
      where = { ...where, ...dynamicFilters };
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
        orderBy: options?.orderBy ?? { createdAt: "desc" },
        include: options?.include,
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
    } as any)) as TEntity | null;
  }

  async create(data: TCreate): Promise<TEntity> {
    return (await this.model.create({
      data: { ...data, organizationId: this.organizationId } as any,
    })) as TEntity;
  }

  async update(id: string, data: TUpdate): Promise<TEntity> {
    return (await this.model.update({
      data: { ...data, organizationId: this.organizationId } as any,
      where: { id },
    } as any)) as TEntity;
  }

  async delete(id: string): Promise<TEntity> {
    return (await this.model.delete({
      where: { id, organizationId: this.organizationId },
    } as any)) as TEntity;
  }
}
