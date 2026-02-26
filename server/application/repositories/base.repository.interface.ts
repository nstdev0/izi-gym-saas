import {
  PageableRequest,
  PageableResponse,
} from "@/shared/types/pagination.types";

export interface PrismaDelegate {
  findMany(args?: any): Promise<unknown[]>;
  findUnique(args?: any): Promise<unknown | null>;
  create(args?: any): Promise<unknown>;
  update(args?: any): Promise<unknown>;
  delete(args?: any): Promise<unknown>;
  count(args?: any): Promise<number>;
}

export interface IBaseRepository<
  TEntity,
  TCreate,
  TUpdate,
  TFilters = unknown,
> {
  findAll(
    request: PageableRequest<TFilters>,
  ): Promise<PageableResponse<TEntity>>;
  findById(id: string): Promise<TEntity | null>;
  findUnique(args: Partial<TEntity>): Promise<TEntity | null>;
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}
