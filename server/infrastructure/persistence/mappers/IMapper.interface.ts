export interface IMapperInterface<TEntity, TPersistence> {
    toDomain(raw: TPersistence): TEntity;
    toPersistence(domain: TEntity): any;
}