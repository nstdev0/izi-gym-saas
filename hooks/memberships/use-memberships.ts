import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { MembershipsService } from "@/lib/services/memberships.service";
import { membershipKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateMembershipInput, UpdateMembershipInput } from "@/server/application/dtos/memberships.dto";
import { PageableRequest } from "@/server/shared/common/pagination";
import { MembershipsFilters } from "@/server/application/repositories/memberships.repository.interface";

export const useMembershipsList = (params: PageableRequest<MembershipsFilters>) => {
    return useQuery({
        queryKey: membershipKeys.list(params),
        queryFn: () => MembershipsService.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useMembershipDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: membershipKeys.detail(id),
        queryFn: () => MembershipsService.getById(id),
        enabled,
    });
};

export const useCreateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMembershipInput) => MembershipsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
            toast.success("Membresía creada exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear membresía");
        },
    });
};

export const useUpdateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMembershipInput }) => MembershipsService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: membershipKeys.lists() });
            await queryClient.cancelQueries({ queryKey: membershipKeys.detail(id) });

            const previousMemberships = queryClient.getQueriesData({ queryKey: membershipKeys.lists() });
            const previousDetail = queryClient.getQueryData(membershipKeys.detail(id));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueriesData({ queryKey: membershipKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    records: old.records.map((membership: any) =>
                        membership.id === id ? { ...membership, ...data } : membership
                    ),
                };
            });

            if (previousDetail) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                queryClient.setQueryData(membershipKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousMemberships, previousDetail };
        },
        onSuccess: () => {
            toast.success("Membresía actualizada exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousMemberships) {
                context.previousMemberships.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(membershipKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar membresía (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
            queryClient.invalidateQueries({ queryKey: membershipKeys.detail(variables.id) });
        },
    });
};

export const useDeleteMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => MembershipsService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: membershipKeys.lists() });

            const previousMemberships = queryClient.getQueriesData({ queryKey: membershipKeys.lists() });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueriesData({ queryKey: membershipKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    records: old.records.filter((membership: any) => membership.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousMemberships };
        },
        onSuccess: () => {
            toast.success("Membresía eliminada exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousMemberships) {
                context.previousMemberships.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar membresía (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
        },
    });
};
