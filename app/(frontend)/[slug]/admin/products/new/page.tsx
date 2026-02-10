import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductsForm } from "../components/products-form";

export default async function NewProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${slug}/admin/products`}>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold tracking-tight">Nuevo Producto</h1>
                        <p className="text-sm text-muted-foreground">Registra un nuevo producto en el inventario</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center w-full">
                <div className="w-full max-w-3xl">
                    <ProductsForm redirectUrl={`/${slug}/admin/products`} />
                </div>
            </div>
        </div>
    );
}
