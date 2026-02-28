import React, { useEffect, useState } from "react";
import { billService } from "../services/billService";
import type { Bill } from "../services/billService";
import { residentService } from "../services/residentService";
import type { Resident } from "../services/residentService";
import { houseService } from "../services/houseService";
import type { House } from "../services/houseService";
import "../pages/Residents.css";

const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    resident_id: "",
    house_id: "",
    billing_year: new Date().getFullYear(),
    billing_month: new Date().getMonth() + 1,
    due_date: "",
    security_fee: 100000,
    maintenance_fee: 15000,
  });
  const [generateData, setGenerateData] = useState({
    billing_year: new Date().getFullYear(),
    billing_month: new Date().getMonth() + 1,
    security_fee: 100000,
    maintenance_fee: 15000,
    due_date: "",
  });

  useEffect(() => {
    loadBills();
    loadResidents();
    loadHouses();
  }, []);

  const loadBills = async () => {
    try {
      setLoading(true);
      const data = await billService.getAll();
      setBills(data);
    } catch (error) {
      console.error("Error loading bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      const data = await residentService.getAll();
      setResidents(data);
    } catch (error) {
      console.error("Error loading residents:", error);
    }
  };

  const loadHouses = async () => {
    try {
      const data = await houseService.getAll();
      setHouses(data);
    } catch (error) {
      console.error("Error loading houses:", error);
    }
  };

  const handleOpenModal = (bill?: Bill) => {
    if (bill) {
      setEditingBill(bill);
      setFormData({
        resident_id: bill.resident_id.toString(),
        house_id: bill.house_id.toString(),
        billing_year: bill.billing_year,
        billing_month: bill.billing_month,
        due_date: bill.due_date,
        security_fee: bill.security_fee,
        maintenance_fee: bill.maintenance_fee,
      });
    } else {
      setEditingBill(null);
      setFormData({
        resident_id: "",
        house_id: "",
        billing_year: new Date().getFullYear(),
        billing_month: new Date().getMonth() + 1,
        due_date: "",
        security_fee: 100000,
        maintenance_fee: 15000,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBill(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        resident_id: Number(formData.resident_id),
        house_id: Number(formData.house_id),
      };

      if (editingBill) {
        await billService.update(editingBill.id, dataToSend);
      } else {
        await billService.create(dataToSend);
      }
      loadBills();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save bill");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
      try {
        await billService.delete(id);
        loadBills();
      } catch (error) {
        alert("Failed to delete bill");
      }
    }
  };

  const handleGenerateMonthly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await billService.generateMonthly(generateData);
      loadBills();
      setShowGenerateModal(false);
      alert("Tagihan bulanan berhasil digenerate!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to generate bills");
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
    return <div className="loading">Loading bills...</div>;
  }

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h2>📄 Manajemen Tagihan</h2>
          <p>Kelola tagihan iuran bulanan</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            className="btn-secondary"
            onClick={() => setShowGenerateModal(true)}>
            🔄 Generate Tagihan Bulanan
          </button>
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            + Tambah Tagihan
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Rumah</th>
              <th>Penghuni</th>
              <th>Periode</th>
              <th>Iuran Satpam</th>
              <th>Iuran Kebersihan</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={bill.id}>
                <td>{index + 1}</td>
                <td>{bill.house?.code || "-"}</td>
                <td>{bill.resident?.name || "-"}</td>
                <td>
                  {getMonthName(bill.billing_month)} {bill.billing_year}
                </td>
                <td>{formatCurrency(bill.security_fee)}</td>
                <td>{formatCurrency(bill.maintenance_fee)}</td>
                <td>
                  <strong>{formatCurrency(bill.total)}</strong>
                </td>
                <td>
                  <span className={`badge ${bill.status}`}>
                    {bill.status === "paid"
                      ? "Lunas"
                      : bill.status === "partial"
                        ? "Sebagian"
                        : "Belum Lunas"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(bill)}
                      title="Edit">
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(bill.id)}
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
              <h3>{editingBill ? "Edit Tagihan" : "Tambah Tagihan"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rumah *</label>
                <select
                  value={formData.house_id}
                  onChange={(e) =>
                    setFormData({ ...formData, house_id: e.target.value })
                  }
                  required>
                  <option value="">-- Pilih Rumah --</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Penghuni *</label>
                <select
                  value={formData.resident_id}
                  onChange={(e) =>
                    setFormData({ ...formData, resident_id: e.target.value })
                  }
                  required>
                  <option value="">-- Pilih Penghuni --</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="form-group"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}>
                <div>
                  <label>Tahun *</label>
                  <input
                    type="number"
                    value={formData.billing_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_year: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Bulan *</label>
                  <select
                    value={formData.billing_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_month: Number(e.target.value),
                      })
                    }
                    required>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Iuran Satpam (Rp) *</label>
                <input
                  type="number"
                  value={formData.security_fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security_fee: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Iuran Kebersihan (Rp) *</label>
                <input
                  type="number"
                  value={formData.maintenance_fee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenance_fee: Number(e.target.value),
                    })
                  }
                  required
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

      {showGenerateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowGenerateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate Tagihan Bulanan</h3>
              <button
                className="modal-close"
                onClick={() => setShowGenerateModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleGenerateMonthly}>
              <div
                className="form-group"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}>
                <div>
                  <label>Tahun *</label>
                  <input
                    type="number"
                    value={generateData.billing_year}
                    onChange={(e) =>
                      setGenerateData({
                        ...generateData,
                        billing_year: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label>Bulan *</label>
                  <select
                    value={generateData.billing_month}
                    onChange={(e) =>
                      setGenerateData({
                        ...generateData,
                        billing_month: Number(e.target.value),
                      })
                    }
                    required>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <option key={month} value={month}>
                          {getMonthName(month)}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  value={generateData.due_date}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      due_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Iuran Satpam (Rp) *</label>
                <input
                  type="number"
                  value={generateData.security_fee}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      security_fee: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Iuran Kebersihan (Rp) *</label>
                <input
                  type="number"
                  value={generateData.maintenance_fee}
                  onChange={(e) =>
                    setGenerateData({
                      ...generateData,
                      maintenance_fee: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <p
                style={{
                  color: "#718096",
                  fontSize: "0.875rem",
                  marginTop: "1rem",
                }}>
                * Tagihan akan digenerate otomatis untuk semua rumah yang dihuni
              </p>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowGenerateModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

export default Bills;
