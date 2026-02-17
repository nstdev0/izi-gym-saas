const getBaseUrl = () => {
    if (typeof window !== 'undefined') return ''; // Browser

    // Prioridad 1: Variable definida manualmente (Producción)
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

    // Prioridad 2: Variable automática de Vercel (Previews/Deployments)
    // Vercel no incluye 'https://' por defecto, hay que agregarlo.
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

    // Prioridad 3: Localhost
    return 'http://localhost:3000';
};

export const fetchClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${getBaseUrl()}${endpoint}`;

    // Ensure content-type is json for mutations if body is present and it's an object (and not FormData)
    const headers = new Headers(options?.headers);
    if (
        options?.body &&
        typeof options.body === 'string' &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        // 1. DEFAULT CRÍTICO PARA TANSTACK QUERY:
        // Evita que Next.js cachee la respuesta HTTP a nivel de red.
        // Dejamos que React Query gestione la memoria y el re-fetching.
        cache: 'no-store',

        // 2. Spread de opciones (permite sobrescribir cache si fuera necesario)
        ...options,

        // 3. Headers procesados
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        // Handle non-2xx responses
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `API Error: ${response.statusText}`);
    }

    // For 204 No Content, return null
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
};
