import { useQuery, useMutation, useQueryClient, keepPreviousData, QueryKey } from "@tanstack/react-query";
import { plansApi } from "@/lib/api-client/plans.api";
import { planKeys } from "@/lib/react-query/query-keys";
import { toast } from "sonner";
import { CreatePlanInput, UpdatePlanInput } from "@/server/application/dtos/plans.dto";
import { PageableRequest, PageableResponse } from "@/server/shared/common/pagination";
import { PlansFilters } from "@/server/domain/types/plans";
import { Plan } from "@/server/domain/entities/Plan";
import { ApiError } from "@/lib/api";

export const usePlansList = (params: PageableRequest<PlansFilters>) => {
    return useQuery({
        queryKey: planKeys.list(params),
        queryFn: () => plansApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const usePlanDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: () => plansApi.getById(id),
        enabled,
    });
};

export const useCreatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreatePlanInput) => plansApi.create(data),
        onSuccess: () => {
            toast.success("Plan creado exitosamente");
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
        onError: (error: ApiError) => {
            toast.error(error.message || "Error al crear el plan");
        },
    });
};

interface PlansContext {
    previousPlans: [QueryKey, PageableResponse<Plan> | undefined][];
    previousDetail: Plan | undefined;
}

export const useUpdatePlan = () => {
    const queryClient = useQueryClient();
    return useMutation<Plan, Error, { id: string; data: UpdatePlanInput }, PlansContext>({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanInput }) => plansApi.update(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: planKeys.lists() });
            await queryClient.cancelQueries({ queryKey: planKeys.detail(id) });

            const previousPlans = queryClient.getQueriesData<PageableResponse<Plan>>({ queryKey: planKeys.lists() });
            const previousDetail = queryClient.getQueryData<Plan>(planKeys.detail(id));

            queryClient.setQueriesData<PageableResponse<Plan>>({ queryKey: planKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.map((plan) =>
                        plan.id === id ? { ...plan, ...data } as Plan : plan
                    ),
                };
            });

            if (previousDetail) {
                queryClient.setQueryData<Plan>(planKeys.detail(id), (old) => {
                    if (!old) return old;
                    return { ...old, ...data } as Plan;
                });
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
            toast.error(error.message || "Error al actualizar el plan");
        },
        onSettled: (_data, _error, variables) => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
        },
    });
};

interface DeletePlanContext {
    previousPlans: [QueryKey, PageableResponse<Plan> | undefined][];
}

export const useDeletePlan = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string, DeletePlanContext>({
        mutationFn: (id: string) => plansApi.delete(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: planKeys.lists() });

            const previousPlans = queryClient.getQueriesData<PageableResponse<Plan>>({ queryKey: planKeys.lists() });

            queryClient.setQueriesData<PageableResponse<Plan>>({ queryKey: planKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    records: old.records.filter((plan) => plan.id !== id),
                    totalRecords: old.totalRecords - 1,
                };
            });

            return { previousPlans };
        },
        onSuccess: () => {
            toast.success("Plan eliminado exitosamente");
        },
        onError: (_error, _variables, context) => {

            if (context?.previousPlans) {
                context.previousPlans.forEach(([key, data]) => {
                    queryClient.setQueryData(key, data);
                });
            }
            toast.error("Error al eliminar plan (cambios revertidos)");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
};

export const useRestorePlan = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => plansApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
            toast.success("Plan restaurado exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al restaurar plan");
        },
    });
};
