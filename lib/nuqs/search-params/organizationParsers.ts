import { parseAsString } from "nuqs";
import { createSearchParamsCache, parseAsInteger } from "nuqs/server";

export const organizationParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString.withDefault(''),
    sort: parseAsString.withDefault('createdAt-desc'),
    status: parseAsString.withDefault('all'),
}

export const organizationsSearchParamsCache = createSearchParamsCache(organizationParsers)