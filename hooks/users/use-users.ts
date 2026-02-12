import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { UsersService } from "@/lib/services/users.service";
import { userKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreateUserInput, UpdateUserInput } from "@/server/application/dtos/users.dto";
import { PageableRequest } from "@/server/shared/common/pagination";
import { UsersFilters } from "@/server/domain/types/users";

export const useUsersList = (params: PageableRequest<UsersFilters>) => {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => UsersService.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useUserDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => UsersService.getById(id),
        enabled,
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateUserInput) => UsersService.create(data),
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
        mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) => UsersService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });
            await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });

            const previousUsers = queryClient.getQueriesData({ queryKey: userKeys.lists() });
            const previousDetail = queryClient.getQueryData(userKeys.detail(id));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    records: old.records.map((user: any) =>
                        user.id === id ? { ...user, ...data } : user
                    ),
                };
            });

            if (previousDetail) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        mutationFn: (id: string) => UsersService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            const previousUsers = queryClient.getQueriesData({ queryKey: userKeys.lists() });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
