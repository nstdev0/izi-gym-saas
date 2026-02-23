import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

export const usersParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    role: parseAsStringEnum(["OWNER", "ADMIN", "STAFF", "TRAINER"]),
    status: parseAsStringEnum(["active", "inactive"]),
};

export const usersCache = createSearchParamsCache(usersParsers);
