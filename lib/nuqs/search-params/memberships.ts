import { parseAsInteger, parseAsString, parseAsStringEnum, createSearchParamsCache } from 'nuqs/server';

export const membershipsParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    status: parseAsStringEnum(["ACTIVE", "PENDING", "EXPIRED", "CANCELLED"]),
};

export const membershipsSearchParamsCache = createSearchParamsCache(membershipsParsers);