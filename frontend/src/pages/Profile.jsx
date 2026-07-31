import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { Spinner } from '../components/Loader';
import { User, Mail, Lock, ShieldCheck, Key, ChevronDown, ChevronUp, Package, Calendar } from 'lucide-react';

export const Profile = ({ setTab }) => {
  const { user, updateProfile, passkeyRegister } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null); // stores order ID of expanded accordion
  const [expandedOrderItems, setExpandedOrderItems] = useState({}); // stores { orderId: [items] }

  // Fetch orders and prefill profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });

      const fetchOrders = async () => {
        try {
          const res = await api.get('/orders/my-orders');
          setOrders(res);
        } catch (err) {
          console.error("Error fetching order history:", err);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name || !profileData.email) {
      toast.error("Name and email are required fields.");
      return;
    }

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setUpdatingProfile(true);
    try {
      const msg = await updateProfile(profileData.name, profileData.email, profileData.password || undefined);
      toast.success(msg || "Profile updated successfully!");
      setProfileData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Simulating the WebAuthn Passkey Registration Dialog
  const handleRegisterPasskey = async () => {
    setRegisteringPasskey(true);
    toast.info("Initializing security key connection...");

    // Simulate standard WebAuthn timeout
    setTimeout(async () => {
      try {
        const mockCredentialId = 'mock-key-' + Math.random().toString(36).substring(2, 15);
        await passkeyRegister(mockCredentialId);
        
        // Update local user state representation (simulate reload)
        user.passkey_credential_id = mockCredentialId;
        
        toast.success("Security Passkey registered! You can now log in passwordless.");
      } catch (err) {
        toast.error("Failed to register Passkey: " + err.message);
      } finally {
        setRegisteringPasskey(false);
      }
    }, 1500);
  };

  // Toggling Accordion
  const toggleOrderAccordion = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    // Fetch details of order items if not already cached
    if (!expandedOrderItems[orderId]) {
      try {
        const details = await api.get(`/orders/${orderId}`);
        setExpandedOrderItems(prev => ({ ...prev, [orderId]: details.items }));
      } catch (err) {
        toast.error("Failed to load order item details.");
      }
    }
  };

  return (
    <div className="container profile-page anim-fade">
      <div className="section-header profile-hdr">
        <h2>My Account & Settings</h2>
        <p>Edit profile details, manage security keys, and track orders</p>
      </div>

      <div className="profile-layout">
        {/* Settings Column */}
        <div className="settings-column">
          {/* Profile Details Form */}
          <div className="settings-card glass-panel">
            <h3>Profile Settings</h3>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon-wrapper">
                  <User className="input-field-icon" size={18} />
                  <input 
                    type="text" 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleProfileChange}
                    className="form-input input-with-icon" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon-wrapper">
                  <Mail className="input-field-icon" size={18} />
                  <input 
                    type="email" 
                    name="email" 
                    value={profileData.email} 
                    onChange={handleProfileChange}
                    className="form-input input-with-icon" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password (leave blank to keep current)</label>
                <div className="input-with-icon-wrapper">
                  <Lock className="input-field-icon" size={18} />
                  <input 
                    type="password" 
                    name="password" 
                    value={profileData.password} 
                    onChange={handleProfileChange}
                    placeholder="••••••••" 
                    className="form-input input-with-icon" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-with-icon-wrapper">
                  <Lock className="input-field-icon" size={18} />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={profileData.confirmPassword} 
                    onChange={handleProfileChange}
                    placeholder="••••••••" 
                    className="form-input input-with-icon" 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-save-profile" disabled={updatingProfile}>
                {updatingProfile ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>

          {/* WebAuthn Passkeys Card */}
          <div className="settings-card glass-panel passkey-card">
            <h3>Passwordless Sign In (WebAuthn)</h3>
            <p className="passkey-desc">
              Register a secure device Passkey (like Touch ID, Face ID, or Windows Hello) to instantly log in without entering your password.
            </p>

            {user && user.passkey_credential_id ? (
              <div className="passkey-registered-badge">
                <ShieldCheck size={20} className="shield-icon" />
                <div>
                  <div className="badge-title">Passkey Connected</div>
                  <div className="badge-subtitle">Secure device login is enabled for this account.</div>
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                className="btn btn-secondary btn-register-passkey" 
                onClick={handleRegisterPasskey}
                disabled={registeringPasskey}
              >
                {registeringPasskey ? <Spinner size="small" /> : <Key size={16} />}
                <span>{registeringPasskey ? 'Registering Device...' : 'Register Device Passkey'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Order History Column */}
        <div className="orders-column">
          <div className="settings-card glass-panel">
            <h3>Previous Orders</h3>
            
            {loadingOrders ? (
              <div className="orders-loading-spinner">
                <Spinner size="medium" />
              </div>
            ) : orders.length === 0 ? (
              <div className="no-orders-illustration">
                <Package size={40} className="no-orders-icon" />
                <p>You haven't placed any orders yet.</p>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('products')}>
                  Browse Shop
                </button>
              </div>
            ) : (
              <div className="orders-accordion-list">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id;
                  const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div key={order.id} className="order-accordion-item">
                      {/* Header Row */}
                      <div 
                        className={`order-accordion-header ${isExpanded ? 'active' : ''}`}
                        onClick={() => toggleOrderAccordion(order.id)}
                      >
                        <div className="order-hdr-meta">
                          <span className="order-hdr-id">#FC-00{order.id}</span>
                          <span className="order-hdr-date"><Calendar size={12} /> {dateStr}</span>
                        </div>
                        <div className="order-hdr-price-status">
                          <span className="order-hdr-price">${order.total.toFixed(2)}</span>
                          <span className={`badge badge-${
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'danger' :
                            order.status === 'pending' ? 'warning' : 'info'
                          }`}>
                            {order.status}
                          </span>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>

                      {/* Expandable items detail panel */}
                      {isExpanded && (
                        <div className="order-accordion-content anim-slide-up">
                          <div className="order-detail-meta-text">
                            <strong>Shipped To:</strong> {order.customer_name} <br />
                            <strong>Address:</strong> {order.address}
                          </div>
                          
                          <div className="order-detail-items-table">
                            <div className="detail-tbl-header">
                              <span>Product</span>
                              <span className="detail-qty-col">Qty</span>
                              <span className="detail-price-col">Price</span>
                            </div>
                            
                            {!expandedOrderItems[order.id] ? (
                              <div className="detail-items-spinner">
                                <Spinner size="small" />
                              </div>
                            ) : (
                              expandedOrderItems[order.id].map((item) => (
                                <div key={item.id} className="detail-tbl-row">
                                  <span className="detail-prod-name">{item.product_name || 'Deleted Product'}</span>
                                  <span className="detail-qty-col">{item.quantity}</span>
                                  <span className="detail-price-col">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          padding-top: 40px;
        }
        .profile-hdr {
          margin-bottom: 30px;
        }
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 30px;
          align-items: start;
        }
        .settings-column, .orders-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .settings-card {
          padding: 24px;
        }
        .settings-card h3 {
          font-size: 1.15rem;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          color: var(--dark);
        }
        .btn-save-profile {
          width: 100%;
        }

        .passkey-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .passkey-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .btn-register-passkey {
          width: 100%;
          border-color: var(--primary);
          color: var(--primary);
        }
        .btn-register-passkey:hover {
          background-color: var(--primary-glow);
          border-color: var(--primary-hover);
        }
        .passkey-registered-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background-color: var(--success-bg);
          border: 1px solid hsla(150, 84%, 25%, 0.2);
          padding: 12px 16px;
          border-radius: var(--radius-sm);
        }
        .shield-icon {
          color: var(--success);
          flex-shrink: 0;
        }
        .badge-title {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--success);
        }
        .badge-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .orders-loading-spinner, .no-orders-illustration {
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          text-align: center;
        }
        .no-orders-icon {
          color: var(--text-muted);
        }
        .no-orders-illustration p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .orders-accordion-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .order-accordion-item {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .order-accordion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background-color: var(--white);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .order-accordion-header:hover {
          background-color: var(--light-gray);
        }
        .order-accordion-header.active {
          background-color: var(--light-gray);
          border-bottom: 1px solid var(--border-color);
        }
        .order-hdr-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .order-hdr-id {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--dark);
        }
        .order-hdr-date {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .order-hdr-price-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .order-hdr-price {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--dark);
        }
        
        .order-accordion-content {
          padding: 16px 18px;
          background-color: var(--white);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .order-detail-meta-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .order-detail-items-table {
          display: flex;
          flex-direction: column;
          font-size: 0.825rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }
        .detail-tbl-header {
          display: flex;
          padding: 8px 12px;
          background-color: var(--light-gray);
          font-weight: 700;
          color: var(--dark);
          border-bottom: 1px solid var(--border-color);
        }
        .detail-tbl-row {
          display: flex;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          color: var(--dark-light);
        }
        .detail-tbl-row:last-child {
          border-bottom: none;
        }
        .detail-prod-name {
          flex: 1;
        }
        .detail-qty-col {
          width: 50px;
          text-align: center;
        }
        .detail-price-col {
          width: 70px;
          text-align: right;
          font-weight: 600;
        }
        .detail-items-spinner {
          display: flex;
          justify-content: center;
          padding: 12px;
        }

        @media (max-width: 992px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .order-accordion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          .order-hdr-price-status {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};
