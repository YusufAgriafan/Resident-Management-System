import React, { useEffect, useState } from "react";
import { residentService } from "../services/residentService";
import type { Resident } from "../services/residentService";
import "./Residents.css";

const Residents: React.FC = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    resident_type: "permanent",
    marital_status: "single",
    ktp: null as File | null,
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await residentService.getAll();
      setResidents(data);
    } catch (error) {
      console.error("Error loading residents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (resident?: Resident) => {
    if (resident) {
      setEditingResident(resident);
      setFormData({
        name: resident.name,
        phone: resident.phone,
        resident_type: resident.resident_type,
        marital_status: resident.marital_status,
        ktp: null,
      });
    } else {
      setEditingResident(null);
      setFormData({
        name: "",
        phone: "",
        resident_type: "permanent",
        marital_status: "single",
        ktp: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingResident(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("resident_type", formData.resident_type);
      formDataToSend.append("marital_status", formData.marital_status);
      if (formData.ktp) {
        formDataToSend.append("ktp", formData.ktp);
      }

      if (editingResident) {
        await residentService.update(editingResident.id, formDataToSend);
      } else {
        await residentService.create(formDataToSend);
      }

      loadResidents();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save resident");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus penghuni ini?")) {
      try {
        await residentService.delete(id);
        loadResidents();
      } catch (error) {
        alert("Failed to delete resident");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading residents...</div>;
  }

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h2>👥 Manajemen Penghuni</h2>
          <p>Kelola data penghuni perumahan</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Tambah Penghuni
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>No. Telepon</th>
              <th>Status Penghuni</th>
              <th>Status Pernikahan</th>
              <th>KTP</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident, index) => (
              <tr key={resident.id}>
                <td>{index + 1}</td>
                <td>{resident.name}</td>
                <td>{resident.phone}</td>
                <td>
                  <span className={`badge ${resident.resident_type}`}>
                    {resident.resident_type === "permanent"
                      ? "Tetap"
                      : "Kontrak"}
                  </span>
                </td>
                <td>
                  <span className={`badge ${resident.marital_status}`}>
                    {resident.marital_status === "married"
                      ? "Menikah"
                      : "Belum Menikah"}
                  </span>
                </td>
                <td>
                  <a
                    href={`http://localhost:8000/storage/${resident.ktp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link">
                    Lihat KTP
                  </a>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(resident)}
                      title="Edit">
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(resident.id)}
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
              <h3>{editingResident ? "Edit Penghuni" : "Tambah Penghuni"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>No. Telepon *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Foto KTP {!editingResident && "*"}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ktp: e.target.files?.[0] || null,
                    })
                  }
                  required={!editingResident}
                />
                {editingResident && (
                  <small>Kosongkan jika tidak ingin mengubah KTP</small>
                )}
              </div>
              <div className="form-group">
                <label>Status Penghuni *</label>
                <select
                  value={formData.resident_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      resident_type: e.target.value as "permanent" | "contract",
                    })
                  }
                  required>
                  <option value="permanent">Tetap</option>
                  <option value="contract">Kontrak</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status Pernikahan *</label>
                <select
                  value={formData.marital_status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marital_status: e.target.value as "single" | "married",
                    })
                  }
                  required>
                  <option value="single">Belum Menikah</option>
                  <option value="married">Menikah</option>
                </select>
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

export default Residents;
