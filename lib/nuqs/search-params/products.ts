import { createSearchParamsCache, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";

export const productsParsers = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    search: parseAsString,
    sort: parseAsString,
    type: parseAsStringEnum(["CONSUMABLE", "GEAR", "MERCH", "SERVICE"]),
    status: parseAsStringEnum(["active", "inactive"]),
};

export const productsCache = createSearchParamsCache(productsParsers);
