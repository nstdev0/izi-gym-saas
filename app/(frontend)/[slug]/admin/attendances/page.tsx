import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";
import { attendanceSearchParamsCache } from "@/lib/nuqs/search-params/attendance";
import AttendanceViewPage from "./components/view-page";
import { attendanceApi } from "@/lib/api-client/attendance.api";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AttendancePage({ searchParams }: PageProps) {
    const queryClient = getQueryClient();

    const { page, limit, search, sort, method } = await attendanceSearchParamsCache.parse(searchParams);

    const filters = {
        page, limit, filters: { search, sort, method }
    }

    await queryClient.prefetchQuery({
        queryKey: attendanceKeys.list(filters),
        queryFn: () => attendanceApi.getAll(filters),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AttendanceViewPage />
        </HydrationBoundary>
    );
}
