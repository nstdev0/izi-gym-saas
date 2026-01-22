export interface PrismaModelDelegate<T> {
  findMany(args?: Record<string, unknown>): Promise<T[]>;
  findUnique(args?: Record<string, unknown>): Promise<T | null>;
  create(args?: Record<string, unknown>): Promise<T>;
  update(args?: Record<string, unknown>): Promise<T>;
  delete(args?: Record<string, unknown>): Promise<T>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
}

export interface IBaseRepository<T> {
  findAll(args?: Record<string, unknown>): Promise<T[]>;
  findUnique(args?: Record<string, unknown>): Promise<T | null>;
  create(args?: Record<string, unknown>): Promise<T>;
  update(
    id: string,
    input: Record<string, unknown>,
    args?: Record<string, unknown>,
  ): Promise<T>;
  delete(args?: Record<string, unknown>): Promise<T>;
}
