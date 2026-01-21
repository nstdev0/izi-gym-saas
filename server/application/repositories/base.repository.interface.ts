import { Prisma } from "@/generated/prisma/client";

export interface PrismaModelDelegate<T> {
  findMany(args?: any): Prisma.PrismaPromise<T[]>;
  findUnique(args?: any): Prisma.PrismaPromise<T | null>;
  create(args: { data: any }): Prisma.PrismaPromise<T>;
  update(args: { where: any; data: any }): Prisma.PrismaPromise<T>;
  delete(args: { where: any }): Prisma.PrismaPromise<T>;
  count(args?: { where?: any }): Prisma.PrismaPromise<number>;
}

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  create(data: Record<string, unknown>): Promise<T>;
  // findAll(): Promise<T[]>;
  // create(data: Record<string, unkwnown> ): Promise<T>;
  // update(args?: Prisma.Args<T, "update">): Promise<T>;
  // delete(args?: Prisma.Args<T, "delete">): Promise<T>;
}
