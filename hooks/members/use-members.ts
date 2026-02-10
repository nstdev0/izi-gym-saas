import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { MembersService } from "@/lib/services/members.service";
import { memberKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateMemberInput, UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { PageableRequest } from "@/server/shared/common/pagination";
import { MembersFilters } from "@/server/application/repositories/members.repository.interface";

export const useMembersList = (params: PageableRequest<MembersFilters>) => {
    return useQuery({
        queryKey: memberKeys.list(params),
        queryFn: () => MembersService.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useMemberDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: memberKeys.detail(id),
        queryFn: () => MembersService.getById(id),
        enabled,
    });
};

export const useCreateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMemberInput) => MembersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            toast.success("Miembro creado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear miembro");
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateMemberInput }) => MembersService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: memberKeys.lists() });
            await queryClient.cancelQueries({ queryKey: memberKeys.detail(id) });

            const previousMembers = queryClient.getQueriesData({ queryKey: memberKeys.lists() });
            const previousDetail = queryClient.getQueryData(memberKeys.detail(id));

            queryClient.setQueriesData({ queryKey: memberKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((member: any) =>
                        member.id === id ? { ...member, ...data } : member
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData(memberKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousMembers, previousDetail };
        },
        onSuccess: () => {
            toast.success("Miembro actualizado exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousMembers) {
                context.previousMembers.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(memberKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar miembro (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(variables.id) });
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => MembersService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: memberKeys.lists() });

            const previousMembers = queryClient.getQueriesData({ queryKey: memberKeys.lists() });

            queryClient.setQueriesData({ queryKey: memberKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((member: any) => member.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousMembers };
        },
        onSuccess: () => {
            toast.success("Miembro eliminado exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousMembers) {
                context.previousMembers.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar miembro (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
};
