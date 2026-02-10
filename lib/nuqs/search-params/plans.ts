import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

export const plansParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString,
    sort: parseAsString,
    status: parseAsStringEnum(["active", "inactive"]),
};

export const plansCache = createSearchParamsCache(plansParsers);
