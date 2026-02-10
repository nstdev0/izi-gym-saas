"use client";

import { Plus, ChevronDown } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { useMembershipsList } from "@/hooks/memberships/use-memberships";
import { MembershipWithRelations } from "@/lib/services/memberships.service";
import Loading from "../loading";
import { Suspense, useState } from "react";
import { useQueryStates } from "nuqs";
import { membershipsParsers } from "@/lib/nuqs/search-params/memberships";
import {
    getCoreRowModel,
    useReactTable,
    flexRender,
    VisibilityState
} from "@tanstack/react-table";
import { columns } from "./memberships-columns";
import SmartFilters, { FilterConfiguration } from "@/components/ui/smart-filters";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function MembershipsViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(membershipsParsers, {
        shallow: true,
        history: "push"
    })

    const { page, limit, ...restFilters } = queryStates

    const { data: paginatedMemberships, isLoading, isFetching } = useMembershipsList({
        page,
        limit,
        filters: restFilters
    });

    const filtersConfig: FilterConfiguration<MembershipWithRelations> = {
        sort: [
            { label: "Fecha Inicio (Reciente)", field: "startDate", value: "startDate-desc" },
            { label: "Fecha Inicio (Antigua)", field: "startDate", value: "startDate-asc" },
            { label: "Fecha Fin (Próxima)", field: "endDate", value: "endDate-asc" },
            { label: "Fecha Fin (Lejana)", field: "endDate", value: "endDate-desc" },
            { label: "Precio (Mayor a Menor)", field: "pricePaid", value: "pricePaid-desc" },
            { label: "Precio (Menor a Mayor)", field: "pricePaid", value: "pricePaid-asc" },
        ],
        filters: [
            {
                key: "status",
                label: "Estado",
                options: [
                    { label: "Activo", value: "ACTIVE" },
                    { label: "Vencido", value: "EXPIRED" },
                    { label: "Pendiente", value: "PENDING" },
                    { label: "Cancelado", value: "CANCELLED" },
                ],
            },
        ],
    };

    const memberships = paginatedMemberships?.records || [];
    const totalPages = paginatedMemberships?.totalPages || 0;
    const totalRecords = paginatedMemberships?.totalRecords || 0;
    const currentRecordsCount = memberships.length;

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: memberships,
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
                id: queryStates.sort.split("-")[0],
                desc: queryStates.sort.endsWith("desc"),
            }] : [],
            pagination: {
                pageIndex: page - 1,
                pageSize: limit,
            }
        },
    });

    const handleFilterChange = (key: string, value: string | null) => {
        setQueryStates({ [key]: value, page: 1 });
    }

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Membresías" }]}
            >
                <PageHeader
                    title="Membresías"
                    description="Gestiona las membresías de los miembros"
                    actions={
                        <Button asChild size="sm" className="gap-2">
                            <Link href={`/${slug}/admin/memberships/new`}>
                                <Plus className="w-4 h-4" /> Nueva Membresía
                            </Link>
                        </Button>
                    }
                />

                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Membresías", value: totalRecords.toString() },
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
                        <SearchInput placeholder="Buscar por miembro o plan..."
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
                            activeValues={{ sort: queryStates.sort, status: queryStates.status }}
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
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            className="px-4 py-3 font-semibold text-foreground uppercase text-xs"
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </TableHead>
                                                    ))}
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
                                                            <TableCell key={cell.id} className="py-3 px-4">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                                        No se encontraron membresías.
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