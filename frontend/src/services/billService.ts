import api from "./api";
import type { ApiResponse } from "./residentService";

export interface Bill {
  id: number;
  resident_id: number;
  house_id: number;
  billing_year: number;
  billing_month: number;
  due_date: string;
  security_fee: number;
  maintenance_fee: number;
  total: number;
  status: "unpaid" | "partial" | "paid";
  created_at: string;
  updated_at: string;
  resident?: {
    id: number;
    name: string;
    phone: string;
  };
  house?: {
    id: number;
    code: string;
  };
  payments?: Array<{
    id: number;
    paid_amount: number;
    payment_date: string;
  }>;
}

export const billService = {
  getAll: async (params?: {
    month?: number;
    year?: number;
    status?: string;
  }): Promise<Bill[]> => {
    const response = await api.get<ApiResponse<Bill[]>>("/bills", { params });
    return response.data.data;
  },

  getById: async (id: number): Promise<Bill> => {
    const response = await api.get<ApiResponse<Bill>>(`/bills/${id}`);
    return response.data.data;
  },

  create: async (data: {
    resident_id: number;
    house_id: number;
    billing_year: number;
    billing_month: number;
    due_date: string;
    security_fee: number;
    maintenance_fee: number;
  }): Promise<Bill> => {
    const response = await api.post<ApiResponse<Bill>>("/bills", data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Bill>): Promise<Bill> => {
    const response = await api.put<ApiResponse<Bill>>(`/bills/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bills/${id}`);
  },

  generateMonthly: async (data: {
    billing_year: number;
    billing_month: number;
    security_fee: number;
    maintenance_fee: number;
    due_date: string;
  }): Promise<Bill[]> => {
    const response = await api.post<ApiResponse<Bill[]>>(
      "/bills/generate-monthly",
      data,
    );
    return response.data.data;
  },
};
