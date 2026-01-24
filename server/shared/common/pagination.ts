export interface FindAllOptions<TWhere = unknown, TOrderBy = unknown> {
  skip?: number;
  take?: number;
  where?: TWhere;
  orderBy?: TOrderBy;
  include?: unknown;
}

export interface PageableRequest<TFilters = unknown> {
  page: number;
  limit: number;
  filters?: TFilters;
}

export interface PageableResponse<T> {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  records: T[];
}
