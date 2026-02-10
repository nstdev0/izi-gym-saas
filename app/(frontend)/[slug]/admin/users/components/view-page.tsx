"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useUsersList } from "@/hooks/users/use-users";
import Loading from "../loading";
import { useQueryStates } from "nuqs";
import { usersParsers } from "@/lib/nuqs/search-params/users";
import { User } from "@/server/domain/entities/User";
import {
    getCoreRowModel,
    useReactTable,
    flexRender,
    VisibilityState
} from "@tanstack/react-table";
import { columns } from "./users-columns";
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

export default function UsersViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(usersParsers, {
        shallow: true,
        history: "push"
    });

    const { page, limit, ...restFilters } = queryStates;

    const { data: paginatedUsers, isLoading, isFetching } = useUsersList({
        page,
        limit,
        filters: {
            search: restFilters.search ?? undefined,
            sort: restFilters.sort ?? undefined,
            role: restFilters.role ?? undefined,
            status: restFilters.status ?? undefined,
        }
    });

    const users = paginatedUsers?.records || [];
    const totalPages = paginatedUsers?.totalPages || 0;
    const totalRecords = paginatedUsers?.totalRecords || 0;
    const currentRecordsCount = users.length;

    const filtersConfig: FilterConfiguration<User> = {
        sort: [
            {
                label: "Nombres (A-Z)",
                field: "firstName",
                value: "firstName-asc"
            },
            {
                label: "Nombres (Z-A)",
                field: "firstName",
                value: "firstName-desc"
            }
        ],

        filters: [
            {
                key: "role",
                label: "Rol",
                options: [
                    { label: "Propietario", value: "OWNER" },
                    { label: "Administrador", value: "ADMIN" },
                    { label: "Staff", value: "STAFF" },
                    { label: "Entrenador", value: "TRAINER" }
                ]
            },
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

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: users,
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
    };

    return (
        <Suspense fallback={<Loading />}>
            <DashboardLayout
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Usuarios" }]}
            >
                <PageHeader
                    title="Gestión de Usuarios"
                    description="Administra los usuarios de tu gimnasio"
                    actions={
                        <Link href={`/${slug}/admin/users/new`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Nuevo Usuario
                            </Button>
                        </Link>
                    }
                />
                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Usuarios", value: totalRecords.toString() },
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
                            placeholder="Buscar por nombres, email..."
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
                            activeValues={{
                                sort: queryStates.sort,
                                role: queryStates.role,
                                status: queryStates.status
                            }}
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
                                                        No se encontraron usuarios.
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