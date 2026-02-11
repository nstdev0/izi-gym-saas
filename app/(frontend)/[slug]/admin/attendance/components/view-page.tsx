"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import Loading from "../loading";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { PageHeader } from "@/components/ui/page-header";
import { useAttendanceList } from "@/hooks/attendance/use-attendance";
import { AttendanceWithMember } from "@/server/application/repositories/attendance.repository.interface";
import { attendanceParsers } from "@/lib/nuqs/search-params/attendance";
import { useQueryStates } from "nuqs";
import {
    useReactTable,
    getCoreRowModel,
    VisibilityState,
} from "@tanstack/react-table";
import { columns } from "./attendance-columns";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AttendanceModal } from "../../dashboard/components/attendance-modal";

export default function AttendanceViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(attendanceParsers, {
        shallow: true,
        history: "push"
    });

    const { page, limit, ...restFilters } = queryStates;

    const { data: paginatedAttendances, isLoading, isFetching } = useAttendanceList({
        page,
        limit,
        filters: restFilters
    });

    const filtersConfig: FilterConfiguration<AttendanceWithMember> = {
        filters: [
            {
                key: "method",
                label: "Método",
                options: [
                    { label: "QR", value: "QR" },
                    { label: "Manual", value: "MANUAL" }
                ]
            }
        ]
    };

    const attendances = paginatedAttendances?.records || [];
    const totalPages = paginatedAttendances?.totalPages || 0;
    const totalRecords = paginatedAttendances?.totalRecords || 0;
    const currentRecordsCount = attendances.length;

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: attendances,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: totalRecords,
        state: {
            columnVisibility,
            sorting: queryStates.sort ? [{
                id: queryStates.sort.split('-')[0],
                desc: queryStates.sort.split('-')[1] === 'desc'
            }] : [],
            pagination: {
                pageIndex: queryStates.page - 1,
                pageSize: queryStates.limit,
            }
        },
    });

    const handleFilterChange = (key: string, value: string | null) => {
        setQueryStates({
            [key]: value,
            page: 1,
        });
    };

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Asistencias" }]}
            >
                <PageHeader
                    title="Registro de Asistencias"
                    description="Historial de check-ins de todos los miembros"
                    actions={
                        <AttendanceModal>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Agregar Asistencia
                            </Button>
                        </AttendanceModal>
                    }
                />
                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Asistencias", value: totalRecords.toString() },
                            { label: "En esta página", value: currentRecordsCount.toString() },
                        ].map((stat, index) => (
                            <Card key={index} className="p-3">
                                <p className="text-xs text-muted-foreground mb-1">
                                    {stat.label}
                                </p>
                                <p className="text-xl font-bold text-foreground">
                                    {isLoading ? "..." : stat.value}
                                </p>
                            </Card>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <SearchInput
                            placeholder="Buscar por nombres o documento..."
                            value={queryStates.search || ""}
                            onChange={(value) => setQueryStates({ search: value, page: 1 })}
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Columnas <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) =>
                                                    column.toggleVisibility(!!value)
                                                }
                                            >
                                                {column.columnDef.header as string || column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <SmartFilters
                            config={filtersConfig}
                            activeValues={{ sort: queryStates.sort, method: queryStates.method }}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <Card className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
                        {isLoading ? (
                            <div className="p-4 flex justify-center items-center h-full">Cargando...</div>
                        ) : (
                            <>
                                <div className={cn("flex-1 overflow-auto transition-opacity duration-200", isFetching ? "opacity-50 pointer-events-none" : "opacity-100")}>
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-secondary/90 backdrop-blur-sm">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow
                                                    key={headerGroup.id}
                                                    className="border-b border-border hover:bg-transparent"
                                                >
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead
                                                                key={header.id}
                                                                className="px-4 py-3 font-semibold text-foreground uppercase text-xs"
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext(),
                                                                    )}
                                                            </TableHead>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                        className="hover:bg-secondary/30 transition-colors border-b border-border"
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id} className="px-4 py-3">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                        No hay asistencias registradas.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {isFetching && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                    </div>
                                )}

                                <div className="p-2 border-t bg-background">
                                    <Pagination
                                        currentPage={queryStates.page}
                                        totalPages={totalPages}
                                        onPageChange={(page) => setQueryStates({ page })}
                                        onLimitChange={(limit) => setQueryStates({ limit, page: 1 })}
                                        currentLimit={queryStates.limit}
                                    />
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </DashboardLayout>
        </Suspense>
    );
}
