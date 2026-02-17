import { fetchClient } from "@/lib/fetch-client";
import { CreateProductSchema, UpdateProductSchema } from "@/server/application/dtos/products.dto";
import { Product } from "@/server/domain/entities/Product";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { ProductsFilters } from "@/server/domain/types/products";

const BASE_API_PATH = "/api/products";

export const productsApi = {
    getAll: (params: PageableRequest<ProductsFilters>) => {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append("page", String(params.page));
        if (params.limit) searchParams.append("limit", String(params.limit));

        if (params.filters) {
            Object.entries(params.filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    searchParams.append(key, String(value));
                }
            });
        }

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${BASE_API_PATH}?${queryString}` : BASE_API_PATH;

        return fetchClient<PageableResponse<Product>>(endpoint);
    },

    getById: (id: string) => {
        return fetchClient<Product>(`${BASE_API_PATH}/${id}`);
    },

    create: (data: CreateProductSchema) => {
        return fetchClient<Product>(BASE_API_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    update: (id: string, data: UpdateProductSchema) => {
        return fetchClient<Product>(`${BASE_API_PATH}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    delete: (id: string) => {
        return fetchClient<void>(`${BASE_API_PATH}/${id}`, {
            method: "DELETE",
        });
    },

    restore: (id: string) => {
        return fetchClient<Product>(`${BASE_API_PATH}/id/${id}/restore`, {
            method: "POST",
        });
    }
}
