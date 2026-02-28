import React, { useEffect, useState } from "react";
import { reportService } from "../services/reportService";
import "../pages/Residents.css";
import "./Reports.css";

const Reports: React.FC = () => {
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [unpaidBills, setUnpaidBills] = useState<any>(null);
  const [overdueBills, setOverdueBills] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadReports();
  }, [selectedMonth, selectedYear]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [monthly, unpaid, overdue] = await Promise.all([
        reportService.getMonthlySummary(selectedYear, selectedMonth),
        reportService.getUnpaidBills(),
        reportService.getOverdueBills(),
      ]);
      setMonthlySummary(monthly);
      setUnpaidBills(unpaid);
      setOverdueBills(overdue);
    } catch (error) {
      console.error("Error loading reports:", error);
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

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2>📈 Laporan</h2>
          <p>Laporan keuangan dan statistik perumahan</p>
        </div>
        <div className="filter-controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="filter-select">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="filter-select">
            {[2024, 2025, 2026, 2027].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      {monthlySummary && (
        <div className="report-section">
          <h3>
            📊 Ringkasan Bulan {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <h4>Total Pemasukan</h4>
                <p className="summary-value">
                  {formatCurrency(monthlySummary.summary.total_income)}
                </p>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="summary-icon">💸</div>
              <div className="summary-content">
                <h4>Total Pengeluaran</h4>
                <p className="summary-value">
                  {formatCurrency(monthlySummary.summary.total_expenses)}
                </p>
              </div>
            </div>
            <div className="summary-card balance">
              <div className="summary-icon">📊</div>
              <div className="summary-content">
                <h4>Saldo</h4>
                <p
                  className={`summary-value ${monthlySummary.summary.balance >= 0 ? "positive" : "negative"}`}>
                  {formatCurrency(monthlySummary.summary.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Expenses by Category */}
          {monthlySummary.expenses_by_category &&
            monthlySummary.expenses_by_category.length > 0 && (
              <div className="table-container" style={{ marginTop: "1.5rem" }}>
                <h4 style={{ padding: "1rem 1rem 0", margin: 0 }}>
                  Pengeluaran per Kategori
                </h4>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Kategori</th>
                      <th>Jumlah Item</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlySummary.expenses_by_category.map((cat: any) => (
                      <tr key={cat.category}>
                        <td>{cat.category}</td>
                        <td>{cat.count}</td>
                        <td>
                          <strong>{formatCurrency(cat.total_amount)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* Unpaid Bills */}
      {unpaidBills && (
        <div className="report-section">
          <h3>📄 Tagihan Belum Lunas</h3>
          <div className="alert alert-warning">
            <strong>{unpaidBills.unpaid_bills_count}</strong> tagihan belum
            lunas dengan total{" "}
            <strong>{formatCurrency(unpaidBills.total_unpaid_amount)}</strong>
          </div>
          {unpaidBills.bills && unpaidBills.bills.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rumah</th>
                    <th>Penghuni</th>
                    <th>Periode</th>
                    <th>Jatuh Tempo</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidBills.bills.slice(0, 10).map((bill: any) => (
                    <tr key={bill.id}>
                      <td>{bill.house?.code}</td>
                      <td>{bill.resident?.name}</td>
                      <td>
                        {bill.billing_month}/{bill.billing_year}
                      </td>
                      <td>
                        {new Date(bill.due_date).toLocaleDateString("id-ID")}
                      </td>
                      <td>
                        <strong>{formatCurrency(bill.total)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${bill.status}`}>
                          {bill.status === "partial"
                            ? "Sebagian"
                            : "Belum Lunas"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Overdue Bills */}
      {overdueBills && overdueBills.overdue_bills_count > 0 && (
        <div className="report-section">
          <h3>⚠️ Tagihan Terlambat</h3>
          <div className="alert alert-danger">
            <strong>{overdueBills.overdue_bills_count}</strong> tagihan
            terlambat dengan total{" "}
            <strong>{formatCurrency(overdueBills.total_overdue_amount)}</strong>
          </div>
          {overdueBills.bills && overdueBills.bills.length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rumah</th>
                    <th>Penghuni</th>
                    <th>Periode</th>
                    <th>Jatuh Tempo</th>
                    <th>Total</th>
                    <th>Terlambat</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueBills.bills.map((bill: any) => {
                    const daysOverdue = Math.floor(
                      (new Date().getTime() -
                        new Date(bill.due_date).getTime()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <tr key={bill.id}>
                        <td>{bill.house?.code}</td>
                        <td>{bill.resident?.name}</td>
                        <td>
                          {bill.billing_month}/{bill.billing_year}
                        </td>
                        <td>
                          {new Date(bill.due_date).toLocaleDateString("id-ID")}
                        </td>
                        <td>
                          <strong>{formatCurrency(bill.total)}</strong>
                        </td>
                        <td>
                          <span className="badge unpaid">
                            {daysOverdue} hari
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
