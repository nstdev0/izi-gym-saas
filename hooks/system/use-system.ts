import { SystemService } from "@/lib/services/system.service";
import { systemKeys } from "@/lib/react-query/query-keys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OrganizationPaginationParams } from "@/lib/services/organizations.service";

export const useSystemStats = () => {
    return useQuery({
        queryKey: systemKeys.stats(),
        queryFn: () => SystemService.getStats(),
    });
};

export const useSystemRecentSignups = () => {
    return useQuery({
        queryKey: systemKeys.recentSignups(),
        queryFn: () => SystemService.getRecentSignups(),
    });
};

export const useSystemRevenueStats = () => {
    return useQuery({
        queryKey: systemKeys.revenue(),
        queryFn: () => SystemService.getRevenueStats(),
    });
};

export const useSystemOrganizations = (params: OrganizationPaginationParams = {}) => {
    return useQuery({
        queryKey: systemKeys.organizations(params),
        queryFn: () => SystemService.getAllOrganizations(params),
    });
};

export const useSuspendOrganization = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, suspend }: { id: string, suspend: boolean }) => SystemService.suspendOrganization(id, suspend),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemKeys.all });
            // Should properly use specific keys but 'all' is safer for now to ensure list updates
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
        queryFn: () => SystemService.getSystemConfig(),
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => SystemService.updateSystemConfig(data),
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
