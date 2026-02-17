export interface FindAllOptions {
  skip?: number;
  take?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  include?: unknown;
}

export interface PageableRequest<TFilters> {
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
