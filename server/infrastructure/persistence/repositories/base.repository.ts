/* eslint-disable @typescript-eslint/no-explicit-any */
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
  constructor(protected readonly model: D) {}

  protected abstract buildQueryFilters(
    filters: TFilters,
  ): Promise<Parameters<D["findMany"]>[0]["where"]>;

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#read
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

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#read
  async findUnique(args: Partial<TEntity>): Promise<TEntity | null> {
    return (await this.model.findUnique({
      where: args,
    } as any)) as TEntity | null;
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#create
  async create(data: TCreate): Promise<TEntity> {
    return (await this.model.create({ data: data as any })) as TEntity;
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#update
  async update(id: string, data: TUpdate): Promise<TEntity> {
    return (await this.model.update({
      data,
      where: { id },
    } as any)) as TEntity;
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete
  async delete(id: string): Promise<TEntity> {
    return (await this.model.delete({
      where: { id },
    } as any)) as TEntity;
  }
}
