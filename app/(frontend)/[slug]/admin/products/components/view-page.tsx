"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { Product, ProductType } from "@/shared/types/products.types";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import SmartFilters, { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, Package, Layers, Download } from "lucide-react";
import Link from "next/link";
import { useProductsList } from "@/hooks/products/use-products";
import Loading from "../loading";
import { StatCardSkeleton } from "@/components/ui/skeletons/stat-card-skeleton";
import { DataTableSkeleton } from "@/components/ui/skeletons/data-table-skeleton";
import { useQueryStates } from "nuqs";
import { productsParsers } from "@/lib/nuqs/search-params/products";
import {
    getCoreRowModel,
    useReactTable,
    flexRender,
    VisibilityState
} from "@tanstack/react-table";
import { columns } from "./products-columns";
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

export default function ProductsViewPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [queryStates, setQueryStates] = useQueryStates(productsParsers, {
        shallow: true,
        history: "push"
    });

    const { page, limit, ...restFilters } = queryStates;

    const { data: paginatedProducts, isLoading, isFetching } = useProductsList({
        page,
        limit,
        filters: {
            search: restFilters.search ?? undefined,
            sort: restFilters.sort ?? undefined,
            type: restFilters.type ?? undefined,
            status: restFilters.status ?? undefined,
        }
    });

    const products = paginatedProducts?.records || [];
    const totalPages = paginatedProducts?.totalPages || 0;
    const totalRecords = paginatedProducts?.totalRecords || 0;
    const currentRecordsCount = products.length;

    const filtersConfig: FilterConfiguration = {
        sort: [
            { label: "Recientes primero", value: "createdAt-desc" },
            { label: "Antiguos primero", value: "createdAt-asc" },
            { label: "Nombre (A-Z)", value: "name-asc" },
            { label: "Nombre (Z-A)", value: "name-desc" },
            { label: "Precio (Mayor a Menor)", value: "price-desc" },
            { label: "Precio (Menor a Mayor)", value: "price-asc" },
            { label: "Stock (Mayor a Menor)", value: "stock-desc" },
            { label: "Stock (Menor a Mayor)", value: "stock-asc" },
        ],
        filters: [
            {
                key: "type",
                label: "Tipo",
                options: [
                    { label: "Consumible", value: ProductType.CONSUMABLE },
                    { label: "Equipamiento", value: ProductType.GEAR },
                    { label: "Merch", value: ProductType.MERCH },
                    { label: "Servicio", value: ProductType.SERVICE },
                ],
            },
            {
                key: "status",
                label: "Estado",
                options: [
                    { label: "Activo", value: "active" },
                    { label: "Inactivo", value: "inactive" },
                ],
            },
        ],
    };

    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data: products,
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
                breadcrumbs={[{ label: "Admin", href: `/${slug}/admin/dashboard` }, { label: "Productos" }]}
            >
                <div className="flex flex-col h-full space-y-6 pb-4">
                    <PageHeader
                        title="Gestión de Productos"
                        description="Administra el inventario y servicios de tu gimnasio"
                        actions={
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="hidden sm:flex gap-2 shadow-sm hover:bg-muted/50">
                                    <Download className="w-4 h-4 text-muted-foreground" />
                                    Exportar
                                </Button>
                                <Button asChild size="sm" className="gap-2 shadow-md hover:shadow-lg transition-all">
                                    <Link href={`/${slug}/admin/products/new`}>
                                        <Plus className="w-4 h-4" />
                                        Nuevo Producto
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    {/* Stats Cards - Con Profundidad y Bordes Semánticos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {isLoading ? (
                            <StatCardSkeleton />
                        ) : (
                            <Card className="border-none shadow-md border-l-4 border-l-blue-500 bg-linear-to-br from-card to-blue-500/5">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Productos</p>
                                        <h3 className="text-2xl font-bold text-foreground">{totalRecords}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {isLoading ? (
                            <StatCardSkeleton />
                        ) : (
                            <Card className="border-none shadow-md border-l-4 border-l-green-500 bg-linear-to-br from-card to-green-500/5">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">En esta página</p>
                                        <h3 className="text-2xl font-bold text-foreground">{currentRecordsCount}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Barra de Herramientas (Búsqueda y Filtros) */}
                    <div className="flex flex-col sm:flex-row gap-3 p-1">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Buscar por nombre, SKU..."
                                value={queryStates.search || ""}
                                onChange={(value) => setQueryStates({ search: value, page: 1 })}
                            />
                        </div>
                        <div className="flex gap-2 items-center">
                            <SmartFilters
                                config={filtersConfig}
                                activeValues={{
                                    sort: queryStates.sort,
                                    type: queryStates.type ?? undefined,
                                    status: queryStates.status ?? undefined,
                                }}
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
                            <DataTableSkeleton rowCount={10} columnCount={5} />
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
                                                            <Package className="h-8 w-8 opacity-20" />
                                                            <p>No se encontraron productos con estos filtros.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {isFetching && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/20 backdrop-blur-[1px]"></div>
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