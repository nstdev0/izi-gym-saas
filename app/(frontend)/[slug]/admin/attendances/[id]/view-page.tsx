"use client";

import { useParams } from "next/navigation";
import { useAttendanceDetail } from "@/hooks/attendance/use-attendance";
import { AttendanceForm } from "../components/attendance-form";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function AttendanceDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AttendanceDetailViewPage() {
    const params = useParams();
    const slug = params.slug as string;
    const id = params.id as string;

    const { data: attendanceDetail, isLoading } = useAttendanceDetail(id);

    return (
        <DashboardLayout
            breadcrumbs={[
                { label: "Admin", href: `/${slug}/admin/dashboard` },
                { label: "Asistencias", href: `/${slug}/admin/attendances` },
                { label: "Detalle" },
            ]}
        >
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${slug}/admin/attendances`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <PageHeader
                        title="Detalle de Asistencia"
                        description="Edita los datos del registro de asistencia"
                    />
                </div>

                {isLoading || !attendanceDetail ? (
                    <AttendanceDetailSkeleton />
                ) : (
                    <AttendanceForm data={attendanceDetail} />
                )}
            </div>
        </DashboardLayout>
    );
}
