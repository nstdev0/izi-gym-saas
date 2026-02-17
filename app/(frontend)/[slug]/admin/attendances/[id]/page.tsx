import { Metadata } from "next";
import { getQueryClient } from "@/lib/react-query/client-config";
import { attendanceKeys } from "@/lib/react-query/query-keys";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import AttendanceDetailViewPage from "./view-page";
import { attendanceApi } from "@/lib/api-client/attendance.api";

export const metadata: Metadata = {
    title: "Detalle de Asistencia",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AttendanceDetailPage({ params }: PageProps) {
    const { id } = await params;

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: attendanceKeys.detail(id),
        queryFn: () => attendanceApi.getById(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AttendanceDetailViewPage />
        </HydrationBoundary>
    );
}
