import React, { useEffect, useState } from "react";
import { paymentService } from "../services/paymentService";
import type { Payment } from "../services/paymentService";
import { billService } from "../services/billService";
import type { Bill } from "../services/billService";
import "../pages/Residents.css";

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    bill_id: "",
    paid_amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_method: "Cash",
    notes: "",
  });

  useEffect(() => {
    loadPayments();
    loadUnpaidBills();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnpaidBills = async () => {
    try {
      const data = await billService.getAll({ status: "unpaid" });
      const partialData = await billService.getAll({ status: "partial" });
      setBills([...data, ...partialData]);
    } catch (error) {
      console.error("Error loading bills:", error);
    }
  };

  const handleOpenModal = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        bill_id: payment.bill_id.toString(),
        paid_amount: payment.paid_amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method,
        notes: payment.notes || "",
      });
    } else {
      setEditingPayment(null);
      setFormData({
        bill_id: "",
        paid_amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: "Cash",
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        bill_id: Number(formData.bill_id),
      };

      if (editingPayment) {
        await paymentService.update(editingPayment.id, dataToSend);
      } else {
        await paymentService.create(dataToSend);
      }
      loadPayments();
      loadUnpaidBills();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save payment");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) {
      try {
        await paymentService.delete(id);
        loadPayments();
        loadUnpaidBills();
      } catch (error) {
        alert("Failed to delete payment");
      }
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
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h2>💰 Manajemen Pembayaran</h2>
          <p>Kelola pembayaran iuran dari penghuni</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Tambah Pembayaran
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Rumah</th>
              <th>Penghuni</th>
              <th>Periode</th>
              <th>Jumlah Bayar</th>
              <th>Metode</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id}>
                <td>{index + 1}</td>
                <td>
                  {new Date(payment.payment_date).toLocaleDateString("id-ID")}
                </td>
                <td>{payment.bill?.house?.code || "-"}</td>
                <td>{payment.bill?.resident?.name || "-"}</td>
                <td>
                  {payment.bill?.billing_month}/{payment.bill?.billing_year}
                </td>
                <td>
                  <strong>{formatCurrency(payment.paid_amount)}</strong>
                </td>
                <td>{payment.payment_method}</td>
                <td>{payment.notes || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(payment)}
                      title="Edit">
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(payment.id)}
                      title="Hapus">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {editingPayment ? "Edit Pembayaran" : "Tambah Pembayaran"}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tagihan *</label>
                <select
                  value={formData.bill_id}
                  onChange={(e) => {
                    const selectedBill = bills.find(
                      (b) => b.id === Number(e.target.value),
                    );
                    setFormData({
                      ...formData,
                      bill_id: e.target.value,
                      paid_amount: selectedBill?.total || 0,
                    });
                  }}
                  required
                  disabled={!!editingPayment}>
                  <option value="">-- Pilih Tagihan --</option>
                  {bills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      {bill.house?.code} - {bill.resident?.name} -{" "}
                      {bill.billing_month}/{bill.billing_year} (
                      {formatCurrency(bill.total)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah Bayar (Rp) *</label>
                <input
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paid_amount: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Pembayaran *</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Metode Pembayaran *</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                  required>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>
              <div className="form-group">
                <label>Catatan</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
