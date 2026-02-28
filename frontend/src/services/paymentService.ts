import api from "./api";
import type { ApiResponse } from "./residentService";

export interface Payment {
  id: number;
  bill_id: number;
  paid_amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  bill?: {
    id: number;
    billing_year: number;
    billing_month: number;
    total: number;
    resident?: {
      id: number;
      name: string;
    };
    house?: {
      id: number;
      code: string;
    };
  };
}

export const paymentService = {
  getAll: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>("/payments", {
      params,
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  create: async (data: {
    bill_id: number;
    paid_amount: number;
    payment_date: string;
    payment_method: string;
    notes?: string;
  }): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>("/payments", data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Payment>): Promise<Payment> => {
    const response = await api.put<ApiResponse<Payment>>(
      `/payments/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
};
