import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏘️ RMS</h2>
          <p>Resident Management</p>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}>
            <span>📊</span> Dashboard
          </Link>
          <Link
            to="/residents"
            className={isActive("/residents") ? "active" : ""}>
            <span>👥</span> Penghuni
          </Link>
          <Link to="/houses" className={isActive("/houses") ? "active" : ""}>
            <span>🏠</span> Rumah
          </Link>
          <Link to="/bills" className={isActive("/bills") ? "active" : ""}>
            <span>📄</span> Tagihan
          </Link>
          <Link
            to="/payments"
            className={isActive("/payments") ? "active" : ""}>
            <span>💰</span> Pembayaran
          </Link>
          <Link
            to="/expenses"
            className={isActive("/expenses") ? "active" : ""}>
            <span>💸</span> Pengeluaran
          </Link>
          <Link to="/reports" className={isActive("/reports") ? "active" : ""}>
            <span>📈</span> Laporan
          </Link>
        </nav>
      </aside>

      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h1>Sistem Manajemen Perumahan</h1>
            <div className="user-menu">
              <span className="user-name">👤 {user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
