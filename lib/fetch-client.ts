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

export class ApiClientError extends Error {
    code: string;
    fields?: Record<string, string[]>;

    constructor(message: string, code: string = "UNKNOWN_ERROR", fields?: Record<string, string[]>) {
        super(message);
        this.name = "ApiClientError";
        this.code = code;
        this.fields = fields;
    }
}

export const fetchClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${getBaseUrl()}${endpoint}`;

    const headers = new Headers(options?.headers);
    if (
        options?.body &&
        typeof options.body === 'string' &&
        !headers.has('Content-Type')
    ) {
        headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
        cache: 'no-store',
        ...options,
        headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new ApiClientError(
            errorBody.message || `API Error: ${response.statusText}`,
            errorBody.code || "UNKNOWN_ERROR",
            errorBody.fields
        );
    }

    // For 204 No Content, return null
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
};
