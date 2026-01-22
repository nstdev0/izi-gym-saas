import {
  IBaseRepository,
  PrismaModelDelegate,
} from "@/server/application/repositories/base.repository.interface";

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  constructor(private readonly model: PrismaModelDelegate<T>) {}

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#read
  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#read
  async findUnique(args?: Record<string, unknown>): Promise<T | null> {
    return await this.model.findUnique({ where: args });
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#create
  async create(args?: Record<string, unknown>): Promise<T> {
    return await this.model.create({ data: args });
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#update
  async update(
    id: string,
    input: Record<string, unknown>,
    args?: Record<string, unknown>,
  ): Promise<T> {
    return await this.model.update({ data: input, where: args?.where });
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#delete
  async delete(args?: Record<string, unknown>): Promise<T> {
    return await this.model.delete({ where: args });
  }
}
