import api from "./api";

export interface Resident {
  id: number;
  name: string;
  ktp: string;
  phone: string;
  resident_type: "permanent" | "contract";
  marital_status: "single" | "married";
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const residentService = {
  getAll: async (): Promise<Resident[]> => {
    const response = await api.get<ApiResponse<Resident[]>>("/residents");
    return response.data.data;
  },

  getById: async (id: number): Promise<Resident> => {
    const response = await api.get<ApiResponse<Resident>>(`/residents/${id}`);
    return response.data.data;
  },

  create: async (formData: FormData): Promise<Resident> => {
    const response = await api.post<ApiResponse<Resident>>(
      "/residents",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  },

  update: async (id: number, formData: FormData): Promise<Resident> => {
    const response = await api.post<ApiResponse<Resident>>(
      `/residents/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/residents/${id}`);
  },
};
