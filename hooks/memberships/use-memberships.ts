import { useQuery, useMutation, useQueryClient, keepPreviousData, QueryKey } from "@tanstack/react-query";
import { membershipsApi } from "@/lib/api-client/memberships.api";
import { ApiClientError } from "@/lib/fetch-client";
import { membershipKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateMembershipInput, UpdateMembershipInput, MembershipResponse } from "@/shared/types/memberships.types";
import { PageableRequest, PageableResponse } from "@/shared/types/pagination.types";
import { MembershipsFilters } from "@/shared/types/memberships.types";

export const useMembershipsList = (params: PageableRequest<MembershipsFilters>) => {
    return useQuery({
        queryKey: membershipKeys.list(params),
        queryFn: () => membershipsApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useMembershipDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: membershipKeys.detail(id),
        queryFn: () => membershipsApi.getById(id),
        enabled: enabled && !!id,
    });
};

export const useCreateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation<MembershipResponse, ApiClientError, CreateMembershipInput>({
        mutationFn: (data: CreateMembershipInput) => membershipsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() });
            toast.success("Membresía creada exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear membresía");
        },
    });
};

interface MembershipsContext {
    previousMemberships: [QueryKey, PageableResponse<MembershipResponse> | undefined][];
    previousDetail: MembershipResponse | undefined;
}

export const useUpdateMembership = () => {
    const queryClient = useQueryClient();
    return useMutation<MembershipResponse, ApiClientError, { id: string; data: UpdateMembershipInput }, MembershipsContext>({
        mutationFn: ({ id, data }: { id: string; data: UpdateMembershipInput }) => membershipsApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: membershipKeys.lists() });
            await queryClient.cancelQueries({ queryKey: membershipKeys.detail(id) });

            const previousMemberships = queryClient.getQueriesData<PageableResponse<MembershipResponse>>({ queryKey: membershipKeys.lists() });
            const previousDetail = queryClient.getQueryData<MembershipResponse>(membershipKeys.detail(id));

            queryClient.setQueriesData<PageableResponse<MembershipResponse>>({ queryKey: membershipKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((membership) =>
                        membership.id === id ? { ...membership, ...data } as MembershipResponse : membership
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData<MembershipResponse>(membershipKeys.detail(id), (old) => {
                    if (!old) return old;
                    return { ...old, ...data } as MembershipResponse;
                });
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
        mutationFn: (id: string) => membershipsApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: membershipKeys.lists() });

            const previousMemberships = queryClient.getQueriesData({ queryKey: membershipKeys.lists() });

            queryClient.setQueriesData({ queryKey: membershipKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((membership: any) => membership.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousMemberships };
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

export const useRestoreMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => membershipsApi.restore(id),
        onSuccess: () => {
            toast.success("Membresía restaurada exitosamente");
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() })
        },
        onError: (error) => {
            toast.error(error.message || "Error al restaurar membresía (cambios revertidos)");
        },
    })
}

export const useCancelMembership = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => membershipsApi.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipKeys.lists() })
        },
        onError: (error) => {
            toast.error(error.message || "Error al cancelar membresía (cambios revertidos)");
        },
    })
}