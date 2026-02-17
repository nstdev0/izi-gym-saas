import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // En el servidor, el staleTime debe ser mayor a 0 para evitar refetching inmediato
                staleTime: 60 * 1000,
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