export interface IMapperInterface<TEntity> {
    toDomain(raw: any): TEntity;
}