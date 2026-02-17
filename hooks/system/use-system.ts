import { systemApi } from "@/lib/api-client/system.api";
import { systemKeys } from "@/lib/react-query/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrganizationPaginationParams } from "@/lib/api-client/organizations.api";

export const useSystemStats = () => {
    return useQuery({
        queryKey: systemKeys.stats(),
        queryFn: () => systemApi.getStats(),
    });
};

export const useSystemRecentSignups = () => {
    return useQuery({
        queryKey: systemKeys.recentSignups(),
        queryFn: () => systemApi.getRecentSignups(),
    });
};

export const useSystemRevenueStats = () => {
    return useQuery({
        queryKey: systemKeys.revenue(),
        queryFn: () => systemApi.getRevenueStats(),
    });
};

export const useSystemOrganizations = (params: OrganizationPaginationParams = {}) => {
    return useQuery({
        queryKey: systemKeys.organizations(params),
        queryFn: () => systemApi.getAllOrganizations(params),
    });
};

export const useSuspendOrganization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, suspend }: { id: string, suspend: boolean }) => systemApi.suspendOrganization(id, suspend),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemKeys.all });
        },
        onError: (error) => {
            toast.error("Failed to update organization status");
            console.error(error);
        }
    });
};

export const useSystemConfig = () => {
    return useQuery({
        queryKey: systemKeys.config(),
        queryFn: () => systemApi.getSystemConfig(),
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => systemApi.updateSystemConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemKeys.config() });
            toast.success("System configuration updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update system configuration");
            console.error(error);
        }
    });
};
