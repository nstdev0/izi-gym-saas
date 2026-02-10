import { parseAsInteger, parseAsString, createSearchParamsCache } from 'nuqs/server';

export const membershipsParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    status: parseAsString.withDefault('all'),
};

export const membershipsSearchParamsCache = createSearchParamsCache(membershipsParsers);