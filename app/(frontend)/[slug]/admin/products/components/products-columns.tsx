"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ProductResponse, ProductType } from "@/shared/types/products.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Box, Tag, Coffee, Shirt, Dumbbell, Sparkles, MoreHorizontal, AlertTriangle, CheckCircle, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { useDeleteProduct, useRestoreProduct } from "@/hooks/products/use-products";
import { toast } from "sonner";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// --- HELPERS VISUALES ---

const getProductTypeConfig = (type: ProductType) => {
    switch (type) {
        case ProductType.CONSUMABLE:
            return { label: "Consumible", icon: Coffee, style: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" };
        case ProductType.GEAR:
            return { label: "Equipamiento", icon: Dumbbell, style: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" };
        case ProductType.MERCH:
            return { label: "Merch", icon: Shirt, style: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" };
        case ProductType.SERVICE:
            return { label: "Servicio", icon: Sparkles, style: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" };
        default:
            return { label: type, icon: Box, style: "bg-gray-100 text-gray-700 border-gray-200" };
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
    }).format(amount);
};

const ProductNameCell = ({ product }: { product: ProductResponse }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { icon: Icon } = getProductTypeConfig(product.type);

    return (
        <div className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-linear-to-br from-background to-muted shadow-sm group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="flex flex-col">
                <Link
                    href={`/${slug}/admin/products/${product.id}`}
                    className="font-medium text-sm text-foreground hover:text-primary transition-colors"
                >
                    {product.name}
                </Link>
                {product.sku ? (
                    <span className="text-[10px] text-muted-foreground font-primary flex items-center gap-1">
                        <Tag className="w-3 h-3 opacity-50" /> {product.sku}
                    </span>
                ) : (
                    <span className="text-[10px] text-muted-foreground italic">Sin SKU</span>
                )}
            </div>
        </div>
    );
};

const ProductActions = ({ product }: { product: ProductResponse }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteProduct, isPending } = useDeleteProduct();
    const { mutate: restoreProduct } = useRestoreProduct();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = () => {
        deleteProduct(product.id, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                toast.success("Producto eliminado", {
                    action: {
                        label: "Deshacer",
                        onClick: () => restoreProduct(product.id),
                    },
                });
            },
        });
    };

    return (
        <>
            <div className="flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/products/${product.id}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/${slug}/admin/products/${product.id}/edit`} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Editar Producto
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar Producto
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                            <Trash2 className="w-5 h-5" /> Eliminar Producto
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente <span className="font-medium text-foreground">"{product.name}"</span> del inventario.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={isPending}
                        >
                            {isPending ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

// --- DEFINICIÓN DE COLUMNAS ---
export const columns: ColumnDef<ProductResponse>[] = [
    {
        accessorKey: "name",
        header: "Producto",
        cell: ({ row }) => <ProductNameCell product={row.original} />,
    },
    {
        accessorKey: "type",
        header: "Categoría",
        cell: ({ row }) => {
            const { label, icon: Icon, style } = getProductTypeConfig(row.getValue("type"));
            return (
                <div className="flex items-center">
                    <Badge variant="outline" className={cn("font-normal shadow-xs gap-1.5 pl-1.5 pr-2.5", style)}>
                        <Icon className="w-3 h-3" />
                        {label}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: "price",
        header: () => <div className="text-right">Precio Unit.</div>,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            return (
                <div className="text-right font-primary font-medium text-foreground">
                    {formatCurrency(price)}
                </div>
            );
        },
    },
    {
        accessorKey: "stock",
        header: "Inventario",
        cell: ({ row }) => {
            const stock = parseInt(row.getValue("stock"));
            const minStock = row.original.minStock;
            const isLowStock = stock <= minStock;

            return (
                <div className={cn(
                    "flex items-center gap-2 font-primary text-sm",
                    isLowStock ? "text-amber-600 font-bold" : "text-muted-foreground"
                )}>
                    {stock}
                    {isLowStock && (
                        <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-sans border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Bajo
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: () => <div className="text-center">Estado</div>,
        cell: ({ row }) => {
            const isActive = row.getValue("isActive");
            return (
                <div className="flex justify-center">
                    <Badge
                        variant="outline"
                        className={cn(
                            "gap-1.5 pl-1.5 pr-2.5 py-0.5 shadow-xs transition-colors",
                            isActive
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700"
                        )}
                    >
                        {isActive ? (
                            <>
                                <CheckCircle className="w-3 h-3" /> Activo
                            </>
                        ) : (
                            <>
                                <XCircle className="w-3 h-3" /> Inactivo
                            </>
                        )}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <ProductActions product={row.original} />,
    },
];