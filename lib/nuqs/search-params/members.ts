import { parseAsInteger, parseAsString, createSearchParamsCache } from 'nuqs/server';

export const membersParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    status: parseAsString.withDefault('all'),
};

export const membersSearchParamsCache = createSearchParamsCache(membersParsers);