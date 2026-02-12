import { Metadata } from "next";
import { makeQueryClient } from "@/lib/react-query/client-config";
import { productKeys } from "@/lib/react-query/query-keys";
import { ProductsService } from "@/lib/services/products.service";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ProductsForm } from "../components/products-form";

export const metadata: Metadata = {
    title: "Detalle de Producto",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductPage({
    params,
}: PageProps) {
    const { id } = await params;

    const queryClient = makeQueryClient()

    await queryClient.prefetchQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => ProductsService.getById(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsForm />
        </HydrationBoundary>
    );
}
