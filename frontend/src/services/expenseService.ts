import api from "./api";
import type { ApiResponse } from "./residentService";

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expense_date: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export const expenseService = {
  getAll: async (params?: {
    start_date?: string;
    end_date?: string;
    category?: string;
  }): Promise<Expense[]> => {
    const response = await api.get<ApiResponse<Expense[]>>("/expenses", {
      params,
    });
    return response.data.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const response = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return response.data.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    amount: number;
    expense_date: string;
    category: string;
  }): Promise<Expense> => {
    const response = await api.post<ApiResponse<Expense>>("/expenses", data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Expense>): Promise<Expense> => {
    const response = await api.put<ApiResponse<Expense>>(
      `/expenses/${id}`,
      data,
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
