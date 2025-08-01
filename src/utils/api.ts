// API configuration for the application
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://waheed-web.vercel.app';

// Helper function to create full API URLs
export const createApiUrl = (endpoint: string): string => {
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

// Common headers for authenticated requests
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};
