"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { Organization } from "@/server/domain/entities/Organization";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import Loading from "../loading";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useOrganizationsList } from "@/hooks/organizations/use-organizations";
import { columns } from "./organizations-columns";
import { useQueryStates } from "nuqs";
import { organizationParsers } from "@/lib/nuqs/search-params/organizationParsers";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function OrganizationsViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(organizationParsers, {
        shallow: true,
        history: "push"
    });

    const { page, limit, ...restFilters } = queryStates;

    const { data: paginatedOrganizations, isLoading, isFetching } = useOrganizationsList({
        page,
        limit,
        ...restFilters,
    });

    const organizations = paginatedOrganizations?.records || [];
    const totalPages = paginatedOrganizations?.totalPages || 0;
    const totalRecords = paginatedOrganizations?.totalRecords || 0;
    const currentRecordsCount = organizations.length;

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: organizations,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: totalRecords,
        state: {
            columnVisibility,
        },
    });

    const filtersConfig: FilterConfiguration<Organization> = {
        sort: [
            { label: "Nombre (A-Z)", field: "name", value: "name-asc" },
            { label: "Nombre (Z-A)", field: "name", value: "name-desc" },
            { label: "Slug (A-Z)", field: "slug", value: "slug-asc" },
            { label: "Slug (Z-A)", field: "slug", value: "slug-desc" },
        ],

        filters: [
            {
                key: "status",
                label: "Estado",
                options: [
                    { label: "Activo", value: "active" },
                    { label: "Inactivo", value: "inactive" }
                ]
            }
        ]
    };

    const handleFilterChange = (key: string, value: string | null) => {
        setQueryStates({
            [key]: value,
            page: 1,
        });
    };

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Organizaciones" }]}
            >
                <div className="flex flex-col h-full space-y-6">
                    <PageHeader
                        title="Gestión de Organizaciones"
                        description="Administra los tenants del sistema"
                        actions={
                            <Link href={`/${slug}/admin/organizations/new`}>
                                <Button size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Plus className="w-4 h-4" />
                                    Nueva Organización
                                </Button>
                            </Link>
                        }
                    />

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-linear-to-br from-card to-blue-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Organizaciones</p>
                                    <h3 className="text-2xl font-bold text-foreground">{isLoading ? "..." : totalRecords}</h3>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md border-l-4 border-l-green-500 bg-linear-to-br from-card to-green-500/5">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">En esta página</p>
                                    <h3 className="text-2xl font-bold text-foreground">{isLoading ? "..." : currentRecordsCount}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 p-1">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Buscar por nombre, slug..."
                                value={queryStates.search || ""}
                                onChange={(value) => {
                                    setQueryStates({
                                        search: value,
                                        page: 1,
                                    });
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <SmartFilters
                                config={filtersConfig}
                                activeValues={{ sort: queryStates.sort, status: queryStates.status }}
                                onFilterChange={handleFilterChange}
                            />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2 shadow-sm">
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

                    <Card className="flex-1 overflow-hidden flex flex-col min-h-0 relative shadow-lg border-muted/40 bg-card/50 backdrop-blur-sm">
                        {isLoading ? (
                            <div className="p-8 flex justify-center items-center h-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-sm text-muted-foreground">Cargando registros...</p>
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
                                                    {headerGroup.headers.map((header) => {
                                                        return (
                                                            <TableHead
                                                                key={header.id}
                                                                className="px-6 py-4 font-semibold text-muted-foreground uppercase text-[0.7rem] tracking-wider"
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
                                                            <Building2 className="h-8 w-8 opacity-20" />
                                                            <p>No hay organizaciones registradas con estos filtros.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="px-4 py-2 border-t border-border/40 bg-background/50 backdrop-blur-sm">
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
