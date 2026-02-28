import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseService";
import type { Expense } from "../services/expenseService";
import "../pages/Residents.css";

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
    category: "salary",
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getAll();
      setExpenses(data);
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        description: expense.description || "",
        amount: expense.amount,
        expense_date: expense.expense_date,
        category: expense.category,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: "",
        description: "",
        amount: 0,
        expense_date: new Date().toISOString().split("T")[0],
        category: "salary",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expenseService.update(editingExpense.id, formData);
      } else {
        await expenseService.create(formData);
      }
      loadExpenses();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save expense");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengeluaran ini?")) {
      try {
        await expenseService.delete(id);
        loadExpenses();
      } catch (error) {
        alert("Failed to delete expense");
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

  const getCategoryLabel = (category: string) => {
    const categories: { [key: string]: string } = {
      salary: "Gaji",
      maintenance: "Pemeliharaan",
      utilities: "Utilitas",
      security: "Keamanan",
      cleaning: "Kebersihan",
      others: "Lainnya",
    };
    return categories[category] || category;
  };

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h2>💸 Manajemen Pengeluaran</h2>
          <p>Kelola pengeluaran perumahan</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Tambah Pengeluaran
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Jumlah</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={expense.id}>
                <td>{index + 1}</td>
                <td>
                  {new Date(expense.expense_date).toLocaleDateString("id-ID")}
                </td>
                <td>{expense.title}</td>
                <td>
                  <span className="badge">
                    {getCategoryLabel(expense.category)}
                  </span>
                </td>
                <td>
                  <strong>{formatCurrency(expense.amount)}</strong>
                </td>
                <td>{expense.description || "-"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(expense)}
                      title="Edit">
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(expense.id)}
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
                {editingExpense ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Judul *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: Gaji Satpam Bulan Februari"
                  required
                />
              </div>
              <div className="form-group">
                <label>Kategori *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required>
                  <option value="salary">Gaji</option>
                  <option value="maintenance">Pemeliharaan</option>
                  <option value="utilities">Utilitas</option>
                  <option value="security">Keamanan</option>
                  <option value="cleaning">Kebersihan</option>
                  <option value="others">Lainnya</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jumlah (Rp) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal *</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Deskripsi pengeluaran (opsional)"
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

export default Expenses;
