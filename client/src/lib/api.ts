import { apiRequest } from "./queryClient";

export const api = {
  getProducts: () => apiRequest("GET", "/api/products"),
  getProduct: (id: number) => apiRequest("GET", `/api/products/${id}`),
  createQuote: (data: any) => apiRequest("POST", "/api/quote", data),
  createPolicy: (data: any) => apiRequest("POST", "/api/policy", data),
  createOrder: (data: any) => apiRequest("POST", "/api/orders", data),
  getOrder: (id: number) => apiRequest("GET", `/api/orders/${id}`),
};
