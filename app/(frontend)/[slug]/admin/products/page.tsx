import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ProductsViewPage from "./components/view-page";
import { ProductsService } from "@/lib/services/products.service";
import { productKeys } from "@/lib/react-query/query-keys";
import { getQueryClient } from "@/lib/react-query/client-config";
import { productsCache } from "@/lib/nuqs/search-params/products";

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
    const { page, limit, ...filters } = await productsCache.parse(searchParams);

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: productKeys.list({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                type: filters.type ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
        queryFn: () => ProductsService.getAll({
            page,
            limit,
            filters: {
                search: filters.search ?? undefined,
                sort: filters.sort ?? undefined,
                type: filters.type ?? undefined,
                status: filters.status ?? undefined,
            }
        }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProductsViewPage />
        </HydrationBoundary>
    );
}