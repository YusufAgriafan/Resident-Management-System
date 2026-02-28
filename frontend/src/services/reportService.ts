import api from "./api";
import type { ApiResponse } from "./residentService";

export interface DashboardStats {
  current_month: {
    month: number;
    year: number;
    income: number;
    expenses: number;
    balance: number;
  };
  bills: {
    unpaid_count: number;
    unpaid_amount: number;
    overdue_count: number;
  };
  houses: {
    total: number;
    occupied: number;
    vacant: number;
  };
  residents: {
    total: number;
    permanent: number;
    contract: number;
  };
}

export interface ChartDataPoint {
  month: number;
  month_name: string;
  income: number;
  expenses: number;
  balance: number;
}

export const reportService = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response =
      await api.get<ApiResponse<DashboardStats>>("/reports/dashboard");
    return response.data.data;
  },

  getChartData: async (year: number): Promise<ChartDataPoint[]> => {
    const response = await api.get<ApiResponse<ChartDataPoint[]>>(
      "/reports/chart-data",
      {
        params: { year },
      },
    );
    return response.data.data;
  },

  getMonthlySummary: async (year: number, month: number) => {
    const response = await api.get("/reports/monthly-summary", {
      params: { year, month },
    });
    return response.data.data;
  },

  getYearlySummary: async (year: number) => {
    const response = await api.get("/reports/yearly-summary", {
      params: { year },
    });
    return response.data.data;
  },

  getUnpaidBills: async () => {
    const response = await api.get("/reports/unpaid-bills");
    return response.data.data;
  },

  getOverdueBills: async () => {
    const response = await api.get("/reports/overdue-bills");
    return response.data.data;
  },
};
