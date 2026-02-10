import { getContainer } from "@/server/di/container";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import { ProductsForm } from "../components/products-form";

export const metadata: Metadata = {
    title: "Detalle de Producto",
};

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string; id: string }>;
}) {
    const { slug, id } = await params;
    const container = await getContainer();
    const product = await container.getProductByIdController.execute(id);

    if (!product) {
        notFound();
    }

    const productPlain = JSON.parse(JSON.stringify(product));

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
                        <h1 className="text-3xl font-bold tracking-tight">
                            {product.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">Gestiona la información del producto</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center w-full">
                <div className="w-full max-w-3xl">
                    <ProductsForm initialData={productPlain} isEdit={true} redirectUrl={`/${slug}/admin/products`} />
                </div>
            </div>
        </div>
    );
}
