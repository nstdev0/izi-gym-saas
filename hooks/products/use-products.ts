import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { ProductsService } from "@/lib/services/products.service";
import { productKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateProductSchema, UpdateProductSchema } from "@/server/application/dtos/products.dto";
import { PageableRequest } from "@/server/shared/common/pagination";
import { ProductsFilters } from "@/server/domain/types/products";

export const useProductsList = (params: PageableRequest<ProductsFilters>) => {
    return useQuery({
        queryKey: productKeys.list(params),
        queryFn: () => ProductsService.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useProductDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => ProductsService.getById(id),
        enabled,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateProductSchema) => ProductsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            toast.success("Producto creado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear producto");
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductSchema }) => ProductsService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });
            await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });

            const previousProducts = queryClient.getQueriesData({ queryKey: productKeys.lists() });
            const previousDetail = queryClient.getQueryData(productKeys.detail(id));

            queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((product: any) =>
                        product.id === id ? { ...product, ...data } : product
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData(productKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousProducts, previousDetail };
        },
        onSuccess: () => {
            toast.success("Producto actualizado exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousProducts) {
                context.previousProducts.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(productKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar producto (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
            queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ProductsService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: productKeys.lists() });

            const previousProducts = queryClient.getQueriesData({ queryKey: productKeys.lists() });

            queryClient.setQueriesData({ queryKey: productKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((product: any) => product.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousProducts };
        },
        onSuccess: () => {
            toast.success("Producto eliminado exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousProducts) {
                context.previousProducts.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar producto (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: productKeys.lists() });
        },
    });
};
