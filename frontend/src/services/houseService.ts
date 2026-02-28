import api from "./api";
import type { ApiResponse } from "./residentService";

export interface House {
  id: number;
  code: string;
  status: "occupied" | "vacant";
  created_at: string;
  updated_at: string;
}

export interface HouseResidentHistory {
  id: number;
  house_id: number;
  resident_id: number;
  start_date: string;
  end_date: string | null;
  resident?: {
    id: number;
    name: string;
    phone: string;
  };
}

export const houseService = {
  getAll: async (): Promise<House[]> => {
    const response = await api.get<ApiResponse<House[]>>("/houses");
    return response.data.data;
  },

  getById: async (id: number): Promise<House> => {
    const response = await api.get<ApiResponse<House>>(`/houses/${id}`);
    return response.data.data;
  },

  create: async (data: { code: string; status: string }): Promise<House> => {
    const response = await api.post<ApiResponse<House>>("/houses", data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: { code?: string; status?: string },
  ): Promise<House> => {
    const response = await api.put<ApiResponse<House>>(`/houses/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/houses/${id}`);
  },

  assignResident: async (
    id: number,
    data: { resident_id: number; start_date: string; end_date?: string | null },
  ): Promise<HouseResidentHistory> => {
    const response = await api.post<ApiResponse<HouseResidentHistory>>(
      `/houses/${id}/assign-resident`,
      data,
    );
    return response.data.data;
  },

  removeResident: async (id: number): Promise<void> => {
    await api.post(`/houses/${id}/remove-resident`);
  },

  getResidentHistory: async (id: number): Promise<HouseResidentHistory[]> => {
    const response = await api.get<ApiResponse<HouseResidentHistory[]>>(
      `/houses/${id}/resident-history`,
    );
    return response.data.data;
  },
};
