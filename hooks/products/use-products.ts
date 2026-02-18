import { useQuery, useMutation, useQueryClient, keepPreviousData, QueryKey } from "@tanstack/react-query";
import { productsApi } from "@/lib/api-client/products.api";
import { ApiClientError } from "@/lib/fetch-client";
import { productKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateProductInput, UpdateProductInput, ProductResponse } from "@/shared/types/products.types";

import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { ProductsFilters } from "@/shared/types/products.types";

export const useProductsList = (params: PageableRequest<ProductsFilters>) => {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => productsApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useProductDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productsApi.getById(id),
        enabled,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation<ProductResponse, ApiClientError, CreateProductInput>({
        mutationFn: (data: CreateProductInput) => productsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Producto creado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear producto");
        },
    });
};

interface ProductsContext {
    previousProducts: [QueryKey, PageableResponse<ProductResponse> | undefined][];
    previousDetail: ProductResponse | undefined;
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation<ProductResponse, ApiClientError, { id: string; data: UpdateProductInput }, ProductsContext>({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) => productsApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });
            await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

            const previousProducts = queryClient.getQueriesData<PageableResponse<ProductResponse>>({ queryKey: productKeys.lists() });
            const previousDetail = queryClient.getQueryData<ProductResponse>(productKeys.detail(id));

            queryClient.setQueriesData<PageableResponse<ProductResponse>>({ queryKey: productKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((product) =>
                        product.id === id ? { ...product, ...data } as ProductResponse : product
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData<ProductResponse>(productKeys.detail(id), (old) => {
                    if (!old) return old;
                    return { ...old, ...data } as ProductResponse;
                });
            }

            return { previousProducts, previousDetail };
        },
        onSuccess: () => {
            toast.success("Producto actualizado exitosamente");
        },
        onError: (_error, variables, context) => {
            if (context?.previousProducts) {
                context.previousProducts.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(productKeys.detail(variables.id), context.previousDetail);
            }
            toast.error("Error al actualizar producto (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
        },
    });
};

interface DeleteProductContext {
    previousProducts: [QueryKey, PageableResponse<ProductResponse> | undefined][];
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation<void, ApiClientError, string, DeleteProductContext>({
        mutationFn: (id: string) => productsApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            const previousProducts = queryClient.getQueriesData<PageableResponse<ProductResponse>>({ queryKey: productKeys.lists() });

            queryClient.setQueriesData<PageableResponse<ProductResponse>>({ queryKey: productKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((product) => product.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousProducts };
        },
        onSuccess: () => {
            toast.success("Producto eliminado exitosamente");
        },
        onError: (_error, _variables, context) => {
            if (context?.previousProducts) {
                context.previousProducts.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error("Error al eliminar producto (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};

export const useRestoreProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await productsApi.restore(id);
        },
        onSuccess: () => {
            toast.success("Producto restaurado correctamente");
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.message || "No se pudo restaurar el producto");
        }
    });
};