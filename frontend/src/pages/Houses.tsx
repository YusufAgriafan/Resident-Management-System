import React, { useEffect, useState } from "react";
import { houseService } from "../services/houseService";
import type { House } from "../services/houseService";
import { residentService } from "../services/residentService";
import type { Resident } from "../services/residentService";
import "../pages/Residents.css";

const Houses: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    status: "vacant" as "occupied" | "vacant",
  });
  const [assignData, setAssignData] = useState({
    resident_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    loadHouses();
    loadResidents();
  }, []);

  const loadHouses = async () => {
    try {
      setLoading(true);
      const data = await houseService.getAll();
      setHouses(data);
    } catch (error) {
      console.error("Error loading houses:", error);
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

  const handleOpenModal = (house?: House) => {
    if (house) {
      setEditingHouse(house);
      setFormData({
        code: house.code,
        status: house.status,
      });
    } else {
      setEditingHouse(null);
      setFormData({
        code: "",
        status: "vacant",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingHouse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHouse) {
        await houseService.update(editingHouse.id, formData);
      } else {
        await houseService.create(formData);
      }
      loadHouses();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save house");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus rumah ini?")) {
      try {
        await houseService.delete(id);
        loadHouses();
      } catch (error) {
        alert("Failed to delete house");
      }
    }
  };

  const handleOpenAssignModal = (house: House) => {
    setSelectedHouse(house);
    setAssignData({
      resident_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    setShowAssignModal(true);
  };

  const handleAssignResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse) return;

    try {
      await houseService.assignResident(selectedHouse.id, {
        resident_id: Number(assignData.resident_id),
        start_date: assignData.start_date,
        end_date: assignData.end_date || null,
      });
      loadHouses();
      setShowAssignModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to assign resident");
    }
  };

  const handleRemoveResident = async (house: House) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengeluarkan penghuni dari rumah ini?",
      )
    ) {
      try {
        await houseService.removeResident(house.id);
        loadHouses();
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to remove resident");
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading houses...</div>;
  }

  return (
    <div className="residents-page">
      <div className="page-header">
        <div>
          <h2>🏠 Manajemen Rumah</h2>
          <p>Kelola data rumah dan penghuninya</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Tambah Rumah
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Rumah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house, index) => (
              <tr key={house.id}>
                <td>{index + 1}</td>
                <td>{house.code}</td>
                <td>
                  <span className={`badge ${house.status}`}>
                    {house.status === "occupied" ? "Dihuni" : "Kosong"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => handleOpenModal(house)}
                      title="Edit">
                      ✏️
                    </button>
                    {house.status === "vacant" ? (
                      <button
                        className="btn-icon"
                        onClick={() => handleOpenAssignModal(house)}
                        title="Assign Penghuni">
                        👤
                      </button>
                    ) : (
                      <button
                        className="btn-icon"
                        onClick={() => handleRemoveResident(house)}
                        title="Keluarkan Penghuni">
                        🚪
                      </button>
                    )}
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(house.id)}
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
              <h3>{editingHouse ? "Edit Rumah" : "Tambah Rumah"}</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Kode Rumah *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Contoh: A-01"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "occupied" | "vacant",
                    })
                  }
                  required>
                  <option value="vacant">Kosong</option>
                  <option value="occupied">Dihuni</option>
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

      {showAssignModal && selectedHouse && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Penghuni ke {selectedHouse.code}</h3>
              <button
                className="modal-close"
                onClick={() => setShowAssignModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleAssignResident}>
              <div className="form-group">
                <label>Pilih Penghuni *</label>
                <select
                  value={assignData.resident_id}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      resident_id: e.target.value,
                    })
                  }
                  required>
                  <option value="">-- Pilih Penghuni --</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} (
                      {resident.resident_type === "permanent"
                        ? "Tetap"
                        : "Kontrak"}
                      )
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Mulai *</label>
                <input
                  type="date"
                  value={assignData.start_date}
                  onChange={(e) =>
                    setAssignData({ ...assignData, start_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Tanggal Selesai (Kosongkan jika tidak ada)</label>
                <input
                  type="date"
                  value={assignData.end_date}
                  onChange={(e) =>
                    setAssignData({ ...assignData, end_date: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAssignModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Houses;
