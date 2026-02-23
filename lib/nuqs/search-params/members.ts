import { parseAsInteger, parseAsString, parseAsStringEnum, createSearchParamsCache } from 'nuqs/server';

export const membersParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    status: parseAsStringEnum(["active", "inactive"]),
    gender: parseAsStringEnum(["MALE", "FEMALE"]),
};

export const membersSearchParamsCache = createSearchParamsCache(membersParsers);