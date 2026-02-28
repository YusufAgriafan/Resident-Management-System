import React, { useEffect, useState } from "react";
import { reportService } from "../services/reportService";
import type { DashboardStats, ChartDataPoint } from "../services/reportService";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDashboardData();
  }, [selectedYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, chartDataResponse] = await Promise.all([
        reportService.getDashboard(),
        reportService.getChartData(selectedYear),
      ]);
      setStats(dashboardStats);
      setChartData(chartDataResponse);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Overview sistem manajemen perumahan</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Pemasukan Bulan Ini</h3>
            <p className="stat-value">
              {formatCurrency(stats.current_month.income)}
            </p>
            <span className="stat-label">
              {getMonthName(stats.current_month.month)}{" "}
              {stats.current_month.year}
            </span>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>Pengeluaran Bulan Ini</h3>
            <p className="stat-value">
              {formatCurrency(stats.current_month.expenses)}
            </p>
            <span className="stat-label">
              {getMonthName(stats.current_month.month)}{" "}
              {stats.current_month.year}
            </span>
          </div>
        </div>

        <div className="stat-card balance">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Saldo Bulan Ini</h3>
            <p className="stat-value">
              {formatCurrency(stats.current_month.balance)}
            </p>
            <span
              className={`stat-label ${stats.current_month.balance >= 0 ? "positive" : "negative"}`}>
              {stats.current_month.balance >= 0 ? "Surplus" : "Defisit"}
            </span>
          </div>
        </div>

        <div className="stat-card bills">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>Tagihan Belum Lunas</h3>
            <p className="stat-value">{stats.bills.unpaid_count}</p>
            <span className="stat-label">
              {formatCurrency(stats.bills.unpaid_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Houses & Residents Stats */}
      <div className="info-grid">
        <div className="info-card">
          <h3>🏠 Status Rumah</h3>
          <div className="info-stats">
            <div className="info-item">
              <span className="info-label">Total Rumah</span>
              <span className="info-value">{stats.houses.total}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dihuni</span>
              <span className="info-value occupied">
                {stats.houses.occupied}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Kosong</span>
              <span className="info-value vacant">{stats.houses.vacant}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>👥 Status Penghuni</h3>
          <div className="info-stats">
            <div className="info-item">
              <span className="info-label">Total Penghuni</span>
              <span className="info-value">{stats.residents.total}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tetap</span>
              <span className="info-value">{stats.residents.permanent}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Kontrak</span>
              <span className="info-value">{stats.residents.contract}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>⚠️ Tagihan Terlambat</h3>
          <div className="info-stats">
            <div className="info-item">
              <span className="info-label">Jumlah Tagihan</span>
              <span className="info-value overdue">
                {stats.bills.overdue_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-header">
          <h3>📈 Grafik Pemasukan & Pengeluaran</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="year-selector">
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#48bb78"
                strokeWidth={3}
                name="Pemasukan"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f56565"
                strokeWidth={3}
                name="Pengeluaran"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month_name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="income" fill="#48bb78" name="Pemasukan" />
              <Bar dataKey="expenses" fill="#f56565" name="Pengeluaran" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const getMonthName = (month: number): string => {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1];
};

export default Dashboard;
