"use client";

import { Plus, ChevronDown, CreditCard, CalendarCheck, CheckCircle2, Download } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { useMembershipsList } from "@/hooks/memberships/use-memberships";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { MembershipWithRelations } from "@/lib/services/memberships.service";

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
                <div className="flex flex-col h-full space-y-6 pb-4">
                    <PageHeader
                        title="Gestión de Membresías"
                        description="Administra las suscripciones y planes de tus miembros"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hidden sm:flex gap-2 shadow-sm hover:bg-muted/50">
                                    <Download className="w-4 h-4 text-muted-foreground" />
                                    Exportar
                                </Button>
                                <Button asChild size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Link href={`/${slug}/admin/memberships/new`}>
                                        <Plus className="w-4 h-4" /> Nueva Membresía
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    {/* Stats Cards - Con Profundidad y Bordes Semánticos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Membresías</p>
                                    <h3 className="text-2xl font-bold text-foreground">{isLoading ? "..." : totalRecords}</h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md border-l-4 border-l-green-500 bg-linear-to-br from-card to-green-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <CalendarCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">En esta página</p>
                                    <h3 className="text-2xl font-bold text-foreground">{isLoading ? "..." : currentRecordsCount}</h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md border-l-4 border-l-purple-500 bg-linear-to-br from-card to-purple-500/5 hidden sm:block">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Activas Hoy</p>
                                    <h3 className="text-2xl font-bold text-foreground">--</h3>
                                    {/* TODO: Calcular activas hoy si el backend lo devuelve */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Barra de Herramientas (Búsqueda y Filtros) */}
                    <div className="flex flex-col sm:flex-row gap-3 p-1">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Buscar por miembro o plan..."
                                value={queryStates.search || ""}
                                onChange={(value) => setQueryStates({ search: value, page: 1 })}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <SmartFilters
                                config={filtersConfig}
                                activeValues={{ sort: queryStates.sort, status: queryStates.status }}
                                onFilterChange={handleFilterChange}
                            />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 shadow-sm border-dashed">
                                        Columnas <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Visibilidad</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
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
                                                    {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                </DropdownMenuCheckboxItem>
                                            );
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Tabla Principal Elevada */}
                    <Card className="flex-1 overflow-hidden flex flex-col min-h-0 relative shadow-lg border-muted/40 bg-card/50 backdrop-blur-sm">
                        {isLoading ? (
                            <div className="p-8 flex justify-center items-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-sm text-muted-foreground">Cargando membresías...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={cn("flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted transition-opacity duration-200", isFetching ? "opacity-60 pointer-events-none" : "opacity-100")}>
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md shadow-sm">
                                            {table.getHeaderGroups().map((headerGroup) => (
                                                <TableRow
                                                    key={headerGroup.id}
                                                    className="border-b border-border/60 hover:bg-transparent"
                                                >
                                                    {headerGroup.headers.map((header) => (
                                                        <TableHead
                                                            key={header.id}
                                                            className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[0.7rem] tracking-wider"
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
                                                        className="hover:bg-muted/30 transition-colors border-b border-border/40 group"
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id} className="px-6 py-3 text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-32 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                            <CreditCard className="h-8 w-8 opacity-20" />
                                                            <p>No se encontraron membresías con estos filtros.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {isFetching && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-[1px]">
                                        {/* Optional loading overlay */}
                                    </div>
                                )}

                                {/* Footer de Paginación */}
                                <div className="p-4 border-t border-border/40 bg-background/50 backdrop-blur-sm">
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