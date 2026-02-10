import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { PlansService } from "@/lib/services/plans.service";
import { planKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreatePlanInput, UpdatePlanInput } from "@/server/application/dtos/plans.dto";
import { PageableRequest } from "@/server/shared/common/pagination";
import { PlansFilters } from "@/server/domain/types/plans";

export const usePlansList = (params: PageableRequest<PlansFilters>) => {
    return useQuery({
        queryKey: planKeys.list(params),
        queryFn: () => PlansService.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const usePlanDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: () => PlansService.getById(id),
        enabled,
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePlanInput) => PlansService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            toast.success("Plan creado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al crear plan");
        },
    });
};

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) => PlansService.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: planKeys.lists() });
            await queryClient.cancelQueries({ queryKey: planKeys.detail(id) });

            const previousPlans = queryClient.getQueriesData({ queryKey: planKeys.lists() });
            const previousDetail = queryClient.getQueryData(planKeys.detail(id));

            queryClient.setQueriesData({ queryKey: planKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((plan: any) =>
                        plan.id === id ? { ...plan, ...data } : plan
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData(planKeys.detail(id), (old: any) => ({ ...old, ...data }));
            }

            return { previousPlans, previousDetail };
        },
        onSuccess: () => {
            toast.success("Plan actualizado exitosamente");
        },
        onError: (error, variables, context) => {
            if (context?.previousPlans) {
                context.previousPlans.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            if (context?.previousDetail) {
                queryClient.setQueryData(planKeys.detail(variables.id), context.previousDetail);
            }
            toast.error(error.message || "Error al actualizar plan (cambios revertidos)");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
        },
    });
};

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => PlansService.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: planKeys.lists() });

            const previousPlans = queryClient.getQueriesData({ queryKey: planKeys.lists() });

            queryClient.setQueriesData({ queryKey: planKeys.lists() }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((plan: any) => plan.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousPlans };
        },
        onSuccess: () => {
            toast.success("Plan eliminado exitosamente");
        },
        onError: (error, _variables, context) => {
            if (context?.previousPlans) {
                context.previousPlans.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error(error.message || "Error al eliminar plan (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
};
