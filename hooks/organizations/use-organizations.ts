import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { organizationsApi } from "@/lib/api-client/organizations.api";
import { organizationKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateOrganizationInput, UpdateOrganizationInput } from "@/shared/types/organizations.types";
import { PageableRequest } from "@/shared/types/pagination.types";
import { OrganizationsFilters } from "@/shared/types/organizations.types";

export const useOrganizationsList = (params: PageableRequest<OrganizationsFilters>) => {
    return useQuery({
        queryKey: organizationKeys.list(params),
        queryFn: () => organizationsApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useOrganizationDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: organizationKeys.detail(id),
        queryFn: () => organizationsApi.getById(id),
        enabled,
    });
};

export const useCreateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrganizationInput) => organizationsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
            toast.success("Organización creada exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear organización");
        },
    });
};

export const useUpdateOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationInput }) => organizationsApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: organizationKeys.lists() });
            await queryClient.cancelQueries({ queryKey: organizationKeys.detail(id) });

            const previousOrganizations = queryClient.getQueriesData({ queryKey: organizationKeys.lists() });
            const previousDetail = queryClient.getQueryData(organizationKeys.detail(id));

            queryClient.setQueriesData({ queryKey: organizationKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((org: any) =>
                        org.id === id ? { ...org, ...data } : org
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData(organizationKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousOrganizations, previousDetail };
        },
        onSuccess: () => {
            toast.success("Organización actualizada exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousOrganizations) {
                context.previousOrganizations.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(organizationKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar organización (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
            queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.id) });
        },
    });
};

export const useDeleteOrganization = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => organizationsApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: organizationKeys.lists() });

            const previousOrganizations = queryClient.getQueriesData({ queryKey: organizationKeys.lists() });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueriesData({ queryKey: organizationKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    records: old.records.filter((org: any) => org.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousOrganizations };
        },
        onSuccess: () => {
            toast.success("Organización eliminada exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousOrganizations) {
                context.previousOrganizations.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar organización (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
        },
    });
};
