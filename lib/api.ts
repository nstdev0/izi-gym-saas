interface ApiFetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export const api = {
  get: <T>(url: string, options?: ApiFetchOptions) =>
    request<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body: unknown, options?: ApiFetchOptions) =>
    request<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown, options?: ApiFetchOptions) =>
    request<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(url: string, body: unknown, options?: ApiFetchOptions) =>
    request<T>(url, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: ApiFetchOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
};

async function request<T>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;
  const queryString = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== undefined) acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>,
        ),
      ).toString()
    : "";

  try {
    const response = await fetch(`${url}${queryString}`, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...rest,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.message || "Ocurrió un error inesperado",
        response.status,
        data.errors,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Error de conexión";
    throw new ApiError(message, 500);
  }
}
