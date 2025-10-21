import { QueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./authToken";

async function customFetch(url: RequestInfo | URL, options?: RequestInit) {
  // Add auth headers to all requests
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookies
  });

  return response;
}

// Helper function for API requests (used by components)
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return response;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await customFetch(`${queryKey[0]}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login if unauthorized
            window.location.href = '/api/auth/google';
            throw new Error('Unauthorized');
          }
          const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        return response.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

