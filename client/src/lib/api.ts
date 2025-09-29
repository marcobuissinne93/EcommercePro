import { apiRequest } from "./queryClient";

export const api = {
  getProducts: () => apiRequest("GET", "/api/products"),
  getProduct: (id: number) => apiRequest("GET", `/api/products/${id}`),
  getProductByImei: (imei: string) => apiRequest("GET", `/api/products/imei/${imei}`),
  createQuote: (data: any) => apiRequest("POST", "/api/quote", data),
  createPolicy: (data: any) => apiRequest("POST", "/api/policy", data),
  createOrder: (data: any) => apiRequest("POST", "/api/orders", data),
  insertInsurance: (data: any) => apiRequest("POST", "/api/insertInsurance", data),
  insertPolicyholder: (data: any) => apiRequest("POST", "/api/insertPolicyHolder", data),
  getOrder: (id: number | null) => apiRequest("GET", `/api/orders/${id}`),
  createClaim: (data: any) => apiRequest("POST", "/api/claims", data),
  getClaims: () => apiRequest("GET", "/api/claims"),
};
