import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { 
  ShoppingCart, 
  User, 
  Search, 
  LogOut, 
  LayoutDashboard, 
  LogIn, 
  UserCheck 
} from 'lucide-react';

export const Navbar = ({ setTab, currentTab, onSearchChange, searchQuery }) => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTabClick = (tab) => {
    setTab(tab);
    setDropdownOpen(false);
  };

  return (
    <header className={`glass-header navbar-main ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => handleTabClick('home')}>
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Green<span className="logo-sub">Basket</span></span>
        </div>

        {/* Catalog Navigation */}
        <nav className="navbar-links">
          <button 
            className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabClick('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${currentTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabClick('products')}
          >
            Shop Items
          </button>
        </nav>

        {/* Live Search Bar (only show on catalog page or navigate to catalog) */}
        <div className="navbar-search">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search organic goods..." 
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentTab !== 'products' && currentTab !== 'home') {
                  setTab('products');
                }
              }}
              className="search-field"
            />
          </div>
        </div>

        {/* Actions (Cart & User) */}
        <div className="navbar-actions">
          {/* Admin Dashboard */}
          {user && user.role === 'admin' && (
            <button 
              className={`btn btn-admin-dashboard-nav ${currentTab === 'admin-dashboard' ? 'active' : ''}`}
              onClick={() => handleTabClick('admin-dashboard')}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
          )}

          {/* Cart Icon */}
          <button 
            className={`cart-btn-wrapper ${currentTab === 'cart' ? 'active' : ''}`}
            onClick={() => handleTabClick('cart')}
          >
            <ShoppingCart size={22} className="cart-icon-nav" />
            {cartCount > 0 && (
              <span className="cart-badge-count">{cartCount}</span>
            )}
          </button>

          {/* User Account */}
          <div className="user-profile-wrapper">
            {user ? (
              <div className="user-dropdown-container">
                <button 
                  className="user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="avatar-circle">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-nav-name">{user.name.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu glass-panel anim-slide-up">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                    
                    <button 
                      className="dropdown-item"
                      onClick={() => handleTabClick('profile')}
                    >
                      <User size={16} />
                      My Profile
                    </button>

                    {user.role === 'admin' && (
                      <button 
                        className="dropdown-item admin-highlight-link"
                        onClick={() => handleTabClick('admin-dashboard')}
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </button>
                    )}

                    <hr className="dropdown-divider" />

                    <button 
                      className="dropdown-item text-danger-item"
                      onClick={() => {
                        logout();
                        handleTabClick('home');
                      }}
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="btn btn-primary btn-login-nav"
                onClick={() => handleTabClick('login')}
              >
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .navbar-main {
          height: 80px;
          display: flex;
          align-items: center;
          transition: var(--transition-normal);
        }
        .navbar-scrolled {
          height: 70px;
          background: rgba(255, 255, 255, 0.95);
        }
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .logo-icon {
          font-size: 1.75rem;
        }
        .logo-text {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.35rem;
          color: var(--dark);
        }
        .logo-sub {
          color: var(--primary);
        }
        .navbar-links {
          display: flex;
          gap: 24px;
        }
        .nav-link {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-muted);
          position: relative;
          padding: 8px 0;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--primary);
          transition: var(--transition-fast);
        }
        .nav-link:hover::after, .nav-link.active::after {
          width: 100%;
        }
        .navbar-search {
          flex: 0 1 320px;
        }
        .search-input-wrapper {
          position: relative;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-field {
          width: 100%;
          padding: 10px 14px 10px 42px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background-color: var(--light-gray);
          color: var(--dark);
          font-size: 0.9rem;
          transition: var(--transition-fast);
        }
        .search-field:focus {
          background-color: var(--white);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .cart-btn-wrapper {
          position: relative;
          color: var(--dark-light);
          padding: 8px;
          border-radius: 50%;
          transition: var(--transition-fast);
        }
        .cart-btn-wrapper:hover, .cart-btn-wrapper.active {
          background-color: var(--light-gray);
          color: var(--primary);
        }
        .cart-badge-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background-color: var(--secondary);
          color: var(--white);
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .user-dropdown-container {
          position: relative;
        }
        .user-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 6px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          transition: var(--transition-fast);
        }
        .user-btn:hover {
          background-color: var(--light-gray);
        }
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: var(--primary);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.9rem;
        }
        .user-nav-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark-light);
        }
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          padding: 8px;
          z-index: 1000;
        }
        .dropdown-header {
          padding: 12px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 6px;
        }
        .dropdown-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--dark);
        }
        .dropdown-email {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--dark-light);
          text-align: left;
          transition: var(--transition-fast);
        }
        .dropdown-item:hover {
          background-color: var(--light-gray);
          color: var(--primary);
        }
        .admin-highlight-link {
          color: var(--primary);
          font-weight: 600;
        }
        .admin-highlight-link:hover {
          background-color: var(--primary-glow);
        }
        .dropdown-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 6px 0;
        }
        .text-danger-item {
          color: var(--danger);
        }
        .text-danger-item:hover {
          background-color: var(--danger-bg);
          color: var(--danger);
        }
        .btn-login-nav {
          padding: 8px 16px;
          font-size: 0.85rem;
        }
        .btn-admin-dashboard-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 0.85rem;
          font-family: var(--font-heading);
          font-weight: 600;
        }
        .btn-admin-dashboard-nav.active {
          background-color: var(--primary);
          color: var(--white);
          box-shadow: 0 4px 12px var(--primary-glow);
        }
        @media (max-width: 768px) {
          .navbar-links, .user-nav-name, .navbar-search {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
