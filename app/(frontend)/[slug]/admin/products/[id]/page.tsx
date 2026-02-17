import { Metadata } from "next";
import { getQueryClient } from "@/lib/react-query/client-config";
import { productKeys } from "@/lib/react-query/query-keys";
import { productsApi } from "@/lib/api-client/products.api";
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

    const queryClient = getQueryClient()

    await queryClient.prefetchQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => productsApi.getById(id),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsForm />
        </HydrationBoundary>
    );
}
