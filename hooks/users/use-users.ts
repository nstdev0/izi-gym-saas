import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { usersApi } from "@/lib/api-client/users.api";
import { userKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateUserInput, UpdateUserInput } from "@/shared/types/users.types";
import { PageableRequest } from "@/shared/types/pagination.types";
import { UsersFilters } from "@/shared/types/users.types";

export const useUsersList = (params: PageableRequest<UsersFilters>) => {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => usersApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useUserDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => usersApi.getById(id),
        enabled,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserInput) => usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Usuario creado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear usuario");
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => usersApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });
            await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

            const previousUsers = queryClient.getQueriesData({ queryKey: userKeys.lists() });
            const previousDetail = queryClient.getQueryData(userKeys.detail(id));

            queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((user: any) =>
                        user.id === id ? { ...user, ...data } : user
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData(userKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousUsers, previousDetail };
        },
        onSuccess: () => {
            toast.success("Usuario actualizado exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousUsers) {
                context.previousUsers.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(userKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar usuario (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => usersApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            const previousUsers = queryClient.getQueriesData({ queryKey: userKeys.lists() });

            queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((user: any) => user.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousUsers };
        },
        onSuccess: () => {
            toast.success("Usuario eliminado exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousUsers) {
                context.previousUsers.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar usuario (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },
    });
};

export const useRestoreUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => usersApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            toast.success("Usuario restaurado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al restaurar usuario");
        },
    });
};
