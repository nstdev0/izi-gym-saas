"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { Product, ProductType } from "@/server/domain/entities/Product";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { FilterConfiguration } from "@/components/ui/smart-filters";
import { useParams } from "next/navigation";
import SmartFilters from "@/components/ui/smart-filters";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useProductsList } from "@/hooks/products/use-products";
import Loading from "../loading";
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

    const filtersConfig: FilterConfiguration<Product> = {
        sort: [
            { label: "Nombre (A-Z)", field: "name", value: "name-asc" },
            { label: "Nombre (Z-A)", field: "name", value: "name-desc" },
            { label: "Precio (Mayor a Menor)", field: "price", value: "price-desc" },
            { label: "Precio (Menor a Mayor)", field: "price", value: "price-asc" },
            { label: "Stock (Mayor a Menor)", field: "stock", value: "stock-desc" },
            { label: "Stock (Menor a Mayor)", field: "stock", value: "stock-asc" },
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
                <PageHeader
                    title="Gestión de Productos"
                    description="Administra el inventario y servicios de tu gimnasio"
                    actions={
                        <Link href={`/${slug}/admin/products/new`}>
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Nuevo Producto
                            </Button>
                        </Link>
                    }
                />
                <div className="flex flex-col h-full space-y-4 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { label: "Total Productos", value: totalRecords.toString() },
                            { label: "En esta página", value: currentRecordsCount.toString() },
                            // { label: "Bajo Stock", value: ??? }
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
                            placeholder="Buscar por nombre, SKU..."
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
                                type: queryStates.type,
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
                                                        No se encontraron productos.
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
