"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product, ProductType } from "@/server/domain/entities/Product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Box, Tag } from "lucide-react";
import Link from "next/link";
import { useDeleteProduct } from "@/hooks/products/use-products";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useParams } from "next/navigation";

const getProductTypeLabel = (type: ProductType) => {
    switch (type) {
        case ProductType.CONSUMABLE: return "Consumible";
        case ProductType.GEAR: return "Equipamiento";
        case ProductType.MERCH: return "Merch";
        case ProductType.SERVICE: return "Servicio";
        default: return type;
    }
}

const ProductActions = ({ product }: { product: Product }) => {
    const params = useParams();
    const slug = params.slug as string;
    const { mutate: deleteProduct, isPending } = useDeleteProduct();
    const [open, setOpen] = useState(false);

    const handleDelete = () => {
        deleteProduct(product.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    return (
        <div className="flex justify-end gap-2">
            <Link href={`/${slug}/admin/products/${product.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                </Button>
            </Link>
            {/* <Link href={`/${slug}/admin/products/${product.id}/edit`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                </Button>
            </Link> */}

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente el producto
                            <span className="font-medium text-foreground"> {product.name} </span>
                            y borrará sus datos de nuestros servidores.
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
        </div>
    );
};

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Nombre",
        cell: ({ row }) => {
            return (
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.getValue("name")}</span>
                    {row.original.sku && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {row.original.sku}
                        </span>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-muted-foreground" />
                <span>{getProductTypeLabel(row.getValue("type"))}</span>
            </div>
        ),
    },
    {
        accessorKey: "price",
        header: "Precio",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            const formatted = new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
            }).format(price);

            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
            const stock = parseInt(row.getValue("stock"));
            const minStock = row.original.minStock;
            const isLowStock = stock <= minStock;

            return (
                <div className={`flex items-center gap-2 ${isLowStock ? "text-amber-600 font-medium" : ""}`}>
                    {stock} {isLowStock && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Bajo</span>}
                </div>
            )
        },
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive");
            return (
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                    {isActive ? "Activo" : "Inactivo"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => <ProductActions product={row.original} />,
    },
];
