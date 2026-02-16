import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AttendanceService } from "@/lib/services/attendance.service";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { attendanceSearchParamsCache } from "@/lib/nuqs/search-params/attendance";
import AttendanceViewPage from "./components/view-page";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
    const queryClient = makeQueryClient();

    const { page, limit, search, sort, method } = await attendanceSearchParamsCache.parse(searchParams);

    const filters = {
        page, limit, filters: { search, sort, method }
    }

    await queryClient.prefetchQuery({
        queryKey: attendanceKeys.list(filters),
        queryFn: () => AttendanceService.getAll(filters),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AttendanceViewPage />
        </HydrationBoundary>
    );
}
