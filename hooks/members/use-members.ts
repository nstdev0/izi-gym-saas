import { useQuery, useMutation, useQueryClient, keepPreviousData, QueryKey } from "@tanstack/react-query";
import { MembersService } from "@/lib/services/members.service";
import { memberKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateMemberInput, UpdateMemberInput } from "@/server/application/dtos/members.dto";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { MembersFilters } from "@/server/application/repositories/members.repository.interface";
import { Member } from "@/server/domain/entities/Member";

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

export const useMemberByQrCode = (qrCode: string, enabled = true) => {
    return useQuery({
        queryKey: memberKeys.detail(qrCode),
        queryFn: () => MembersService.getByQrCode(qrCode),
        enabled: enabled && !!qrCode && qrCode.length > 0,
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

interface MembersContext {
    previousMembers: [QueryKey, PageableResponse<Member> | undefined][];
    previousDetail: Member | undefined;
}

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    return useMutation<Member, Error, { id: string; data: UpdateMemberInput }, MembersContext>({
        mutationFn: ({ id, data }: { id: string; data: UpdateMemberInput }) => MembersService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: memberKeys.lists() });
            await queryClient.cancelQueries({ queryKey: memberKeys.detail(id) });

            const previousMembers = queryClient.getQueriesData<PageableResponse<Member>>({ queryKey: memberKeys.lists() });
            const previousDetail = queryClient.getQueryData<Member>(memberKeys.detail(id));

            queryClient.setQueriesData<PageableResponse<Member>>({ queryKey: memberKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((member) =>
                        member.id === id ? { ...member, ...data } as Member : member
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData<Member>(memberKeys.detail(id), (old) => {
                    if (!old) return old;
                    return { ...old, ...data } as Member;
                });
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

interface DeleteMemberContext {
    previousMembers: [QueryKey, PageableResponse<Member> | undefined][];
}

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string, DeleteMemberContext>({
        mutationFn: (id: string) => MembersService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: memberKeys.lists() });

            const previousMembers = queryClient.getQueriesData<PageableResponse<Member>>({ queryKey: memberKeys.lists() });

            queryClient.setQueriesData<PageableResponse<Member>>({ queryKey: memberKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((member) => member.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousMembers };
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

export const useRestoreMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            return await MembersService.restore(id);
        },
        onSuccess: () => {
            toast.success("Miembro restaurado correctamente");
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
        onError: (error) => {
            toast.error(error.message || "No se pudo restaurar el miembro");
        }
    });
};
