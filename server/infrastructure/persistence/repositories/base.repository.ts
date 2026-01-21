import { Prisma } from "@/generated/prisma/client";
import {
  IBaseRepository,
  PrismaModelDelegate,
} from "@repositories/base.repository.interface";

export class BaseRepository<T> implements IBaseRepository<T> {
  constructor(private readonly model: PrismaModelDelegate<T>) {}
  async findAll(): Promise<T[]> {
    return await this.model.findMany();
  }
  async create(input: Record<string, unknown>): Promise<T> {
    return await this.model.create({ data: input });
  }
  // async update(args?: Record<string, unknown>): Promise<T> {
  //   return await this.model.update(args);
  // }
  // async delete(args?: Record<string, unknown>): Promise<T> {
  //   return await this.model.delete(args);
  // }
}
