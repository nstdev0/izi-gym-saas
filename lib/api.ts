export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>; // Para /:id
  query?: Record<string, string | number | boolean | undefined | null>; // Para ?page=1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any; // Body tipado genérico
}

/**
 * Construye la URL inyectando path params (:id) y query params (?q=)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUrl(path: string, params?: Record<string, any>, query?: Record<string, any>) {
  let url = path;

  // 1. Path Params: /api/members/:id -> /api/members/123
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  // 2. Query Params: ?active=true&page=1
  if (query) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  return url;
}

async function request<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { params, query, body, headers, ...rest } = options;

  // Asumimos que la URL base es relativa para llamadas internas al mismo dominio (evita CORS)
  // NEXT_PUBLIC_APP_URL se debe usar solo para generar links absolutos (invitaciones, emails), no para fetch interno
  const baseUrl = "";
  const finalUrl = `${baseUrl}${buildUrl(endpoint, params, query)}`;

  const config: RequestInit = {
    headers: {
      // Solo agregamos Content-Type si hay body
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...rest,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(finalUrl, config);
    // Manejo de 204 No Content
    if (response.status === 204) return {} as T;

    // Intentamos parsear JSON, si falla (ej: 404 HTML por default de Next), devolvemos objeto vacío
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Lanzamos el error con la estructura EXACTA que manda tu api-handler
      throw new ApiError(
        data.message || "Error desconocido en la petición",
        response.status,
        data.code,   // Código de error (ej: VALIDATION_ERROR)
        data.errors  // Errores de Zod
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const message = error instanceof Error ? error.message : "Error de conexión";
    throw new ApiError(message, 500, "NETWORK_ERROR");
  }
}

// Wrapper simplificado
export const api = {
  get: <T>(url: string, opts?: ApiFetchOptions) =>
    request<T>(url, { ...opts, method: "GET" }),

  post: <T>(url: string, body: unknown, opts?: ApiFetchOptions) =>
    request<T>(url, { ...opts, method: "POST", body }),

  put: <T>(url: string, body: unknown, opts?: ApiFetchOptions) =>
    request<T>(url, { ...opts, method: "PUT", body }),

  patch: <T>(url: string, body: unknown, opts?: ApiFetchOptions) =>
    request<T>(url, { ...opts, method: "PATCH", body }),

  delete: <T>(url: string, opts?: ApiFetchOptions) =>
    request<T>(url, { ...opts, method: "DELETE" }),
};