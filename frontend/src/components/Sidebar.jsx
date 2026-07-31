import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tag, 
  Users, 
  CreditCard, 
  ArrowLeft, 
  LogOut 
} from 'lucide-react';

export const Sidebar = ({ currentTab, setTab }) => {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'admin-dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'admin-products', name: 'Products', icon: <ShoppingBag size={20} /> },
    { id: 'admin-categories', name: 'Categories', icon: <Tag size={20} /> },
    { id: 'admin-users', name: 'Users', icon: <Users size={20} /> },
    { id: 'admin-orders', name: 'Orders', icon: <CreditCard size={20} /> },
  ];

  return (
    <aside className="admin-sidebar glass-panel">
      {/* Brand Logo */}
      <div className="sidebar-brand" onClick={() => setTab('home')}>
        <span className="logo-icon">🌿</span>
        <span className="logo-text">Green<span className="logo-sub">Basket</span></span>
        <span className="badge badge-primary sidebar-role">Admin</span>
      </div>

      {/* Main Navigation Links */}
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-link ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Footer Navigation (Back to Shop & Logout) */}
      <div className="sidebar-footer">
        <button
          className="sidebar-link back-to-shop-btn"
          onClick={() => setTab('home')}
        >
          <ArrowLeft size={18} />
          <span>Customer Shop</span>
        </button>

        <button
          className="sidebar-link logout-btn text-danger-item"
          onClick={() => {
            logout();
            setTab('home');
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      <style>{`
        .admin-sidebar {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          border-radius: 0;
          border-right: 1px solid var(--border-color);
          border-top: none;
          border-bottom: none;
          border-left: none;
          background-color: var(--white);
          z-index: 100;
        }

        .sidebar-brand {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          border-bottom: 1px solid var(--border-color);
        }

        .sidebar-brand .logo-text {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.25rem;
        }

        .sidebar-role {
          font-size: 0.65rem;
          padding: 2px 6px;
          margin-left: auto;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-muted);
          text-align: left;
          transition: var(--transition-fast);
        }

        .sidebar-link-icon {
          display: flex;
          align-items: center;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }

        .sidebar-link:hover {
          background-color: var(--light-gray);
          color: var(--primary);
        }

        .sidebar-link:hover .sidebar-link-icon {
          color: var(--primary);
        }

        .sidebar-link.active {
          background-color: var(--primary-glow);
          color: var(--primary);
        }

        .sidebar-link.active .sidebar-link-icon {
          color: var(--primary);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .back-to-shop-btn {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .logout-btn {
          font-weight: 500;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 100%;
            height: auto;
            position: relative;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .sidebar-nav {
            flex-direction: row;
            padding: 8px;
            overflow-x: auto;
            gap: 4px;
          }
          .sidebar-link {
            padding: 8px 12px;
            white-space: nowrap;
            width: auto;
          }
          .sidebar-link-text {
            display: none;
          }
          .sidebar-footer {
            flex-direction: row;
            padding: 8px;
            justify-content: space-between;
          }
          .sidebar-role {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
};
