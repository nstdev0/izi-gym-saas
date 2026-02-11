import { parseAsInteger, parseAsString, createSearchParamsCache } from 'nuqs/server';

export const attendanceParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    method: parseAsString.withDefault('all'),
};

export const attendanceSearchParamsCache = createSearchParamsCache(attendanceParsers);
