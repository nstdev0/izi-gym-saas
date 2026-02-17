import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api-client/attendance.api";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { PageableRequest } from "@/server/shared/common/pagination";
import { AttendanceFilters } from "@/server/application/repositories/attendance.repository.interface";
import { UpdateAttendanceInput } from "@/server/application/dtos/attendance.dto";
import { toast } from "sonner";

export const useAttendanceList = (params: PageableRequest<AttendanceFilters>) => {
    return useQuery({
        queryKey: attendanceKeys.list(params),
        queryFn: () => attendanceApi.getAll(params),
        placeholderData: keepPreviousData,
    });
};

export const useAttendanceDetail = (id: string, enabled = true) => {
    return useQuery({
        queryKey: attendanceKeys.detail(id),
        queryFn: () => attendanceApi.getById(id),
        enabled,
    });
};

export const useUpdateAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceInput }) =>
            attendanceApi.update(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(variables.id) });
            toast.success("Asistencia actualizada exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al actualizar asistencia");
        },
    });
};

export const useDeleteAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => attendanceApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
            toast.success("Asistencia eliminada exitosamente");
        },
        onError: (error) => {
            toast.error(error.message || "Error al eliminar asistencia");
        },
    });
};
