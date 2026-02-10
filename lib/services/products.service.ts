import { fetchClient } from "@/lib/api-client";
import { CreateProductSchema, UpdateProductSchema } from "@/server/application/dtos/products.dto";
import { Product } from "@/server/domain/entities/Product";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { ProductsFilters } from "@/server/domain/types/products";

export class ProductsService {
    private static readonly BASE_PATH = "/api/products";

    static async getAll(params: PageableRequest<ProductsFilters>) {
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
        const endpoint = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

        return fetchClient<PageableResponse<Product>>(endpoint);
    }

    static async getById(id: string) {
        return fetchClient<Product>(`${this.BASE_PATH}/${id}`);
    }

    static async create(data: CreateProductSchema) {
        return fetchClient<Product>(this.BASE_PATH, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    static async update(id: string, data: UpdateProductSchema) {
        return fetchClient<Product>(`${this.BASE_PATH}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    static async delete(id: string) {
        return fetchClient<void>(`${this.BASE_PATH}/${id}`, {
            method: "DELETE",
        });
    }
}
