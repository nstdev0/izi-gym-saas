import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 1000,
                retry: 1,
                refetchOnWindowFocus: true
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
    if (typeof window === "undefined") {
        // Servidor: SIEMPRE crea un nuevo cliente
        return makeQueryClient();
    } else {
        // Cliente (Browser): Reutiliza el cliente existente (Singleton)
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}