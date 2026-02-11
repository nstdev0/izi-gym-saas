import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AttendanceService } from "@/lib/services/attendance.service";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { PageableRequest } from "@/server/shared/common/pagination";
import { AttendanceFilters } from "@/server/application/repositories/attendance.repository.interface";

export const useAttendanceList = (params: PageableRequest<AttendanceFilters>) => {
    return useQuery({
        queryKey: attendanceKeys.list(params),
        queryFn: () => AttendanceService.getAll(params),
        placeholderData: keepPreviousData,
    });
};
