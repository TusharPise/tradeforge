import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = Cookies.get('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'An API error occurred');
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

apiClient.get = (endpoint: string, options?: RequestInit) => 
  apiClient(endpoint, { ...options, method: 'GET' });

apiClient.post = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) });

apiClient.put = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });

apiClient.patch = (endpoint: string, data?: any, options?: RequestInit) => 
  apiClient(endpoint, { ...options, method: 'PATCH', body: data ? JSON.stringify(data) : undefined });

apiClient.delete = (endpoint: string, options?: RequestInit) => 
  apiClient(endpoint, { ...options, method: 'DELETE' });
