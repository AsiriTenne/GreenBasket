import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { Spinner, TableSkeleton } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { Eye, Search, SlidersHorizontal, CreditCard, Calendar, Truck } from 'lucide-react';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Detail Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res = await api.get(`/orders?${queryParams.toString()}`);
      setOrders(res);
    } catch (err) {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleOpenDetailModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setDetailModalOpen(true);
    setDetailLoading(true);

    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrderDetail(res);
    } catch (err) {
      toast.error("Failed to load order details.");
      setDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrderId) return;
    setStatusUpdating(true);
    try {
      await api.put(`/orders/${selectedOrderId}/status`, { status: newStatus });
      toast.success("Order status updated successfully.");
      
      // Reload details and order lists
      const updatedDetails = await api.get(`/orders/${selectedOrderId}`);
      setOrderDetail(updatedDetails);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || "Failed to update order status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="admin-orders-page anim-fade">
      {/* Title Header */}
      <div className="dashboard-header-row">
        <div>
          <h2>Order Queue</h2>
          <p>Fulfill client purchases, modify delivery statuses, and audit receipts</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="admin-filters-bar glass-panel">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Name, or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input filter-search"
          />
        </div>

        <div className="admin-category-filter">
          <SlidersHorizontal size={16} className="filter-icon" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : orders.length === 0 ? (
        <div className="admin-empty-state glass-panel">
          <h3>No orders found</h3>
          <p>Orders will register once customer checkout flows complete.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Grand Total</th>
                <th>Date Placed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const dateStr = new Date(o.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <tr key={o.id}>
                    <td><code>#FC-00{o.id}</code></td>
                    <td><strong>{o.customer_name}</strong></td>
                    <td><code>{o.email}</code></td>
                    <td><strong>${o.total.toFixed(2)}</strong></td>
                    <td>{dateStr}</td>
                    <td>
                      <span className={`badge badge-${
                        o.status === 'delivered' ? 'success' :
                        o.status === 'cancelled' ? 'danger' :
                        o.status === 'pending' ? 'warning' : 'info'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-group">
                        <button 
                          className="table-action-btn edit"
                          onClick={() => handleOpenDetailModal(o.id)}
                          title="View Order Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedOrderId ? `Order Details: #FC-00${selectedOrderId}` : ''}
      >
        {detailLoading || !orderDetail ? (
          <div className="order-modal-spinner">
            <Spinner size="medium" />
            <p>Loading invoice data...</p>
          </div>
        ) : (
          <div className="order-details-modal-body">
            {/* Customer Details info */}
            <div className="order-modal-meta-grid">
              <div className="meta-sec">
                <h4>1. Recipient Details</h4>
                <p><strong>Name:</strong> {orderDetail.order.customer_name}</p>
                <p><strong>Email:</strong> {orderDetail.order.email}</p>
                <p><strong>Address:</strong> <span className="address-style">{orderDetail.order.address}</span></p>
              </div>

              {/* Status Update Control */}
              <div className="meta-sec status-update-sec">
                <h4>2. Change Status</h4>
                <div className="status-control-row">
                  <select 
                    value={orderDetail.order.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdating}
                    className="form-input status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {statusUpdating && <Spinner size="small" />}
                </div>
                <p className="file-input-sub">
                  Restoring stock takes place automatically if transitioning state to <em>Cancelled</em>.
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="modal-order-items-sec">
              <h4>3. Purchased Items</h4>
              <div className="modal-items-table">
                <div className="modal-items-header">
                  <span>Product Name</span>
                  <span className="qty-col">Quantity</span>
                  <span className="price-col">Price Each</span>
                  <span className="total-col">Subtotal</span>
                </div>
                <div className="modal-items-list">
                  {orderDetail.items.map(item => (
                    <div key={item.id} className="modal-item-row">
                      <span>{item.product_name || 'Deleted Product'}</span>
                      <span className="qty-col">{item.quantity}</span>
                      <span className="price-col">${item.price.toFixed(2)}</span>
                      <span className="total-col">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="modal-financial-breakdown">
              <div className="finance-row">
                <span>Subtotal:</span>
                <span>${orderDetail.order.subtotal.toFixed(2)}</span>
              </div>
              <div className="finance-row">
                <span>Sales Tax (8%):</span>
                <span>${orderDetail.order.tax.toFixed(2)}</span>
              </div>
              <div className="finance-row grand-total">
                <span>Grand Total:</span>
                <span>${orderDetail.order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button className="btn btn-secondary" onClick={() => setDetailModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .admin-orders-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .order-modal-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
          gap: 12px;
          color: var(--text-muted);
        }

        .order-details-modal-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .order-modal-meta-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }
        .meta-sec h4 {
          font-size: 0.95rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          margin-bottom: 10px;
        }
        .meta-sec p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .address-style {
          font-style: italic;
        }

        .status-control-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status-select {
          padding: 8px 12px;
          width: 150px;
        }

        .modal-order-items-sec h4 {
          font-size: 0.95rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
          margin-bottom: 10px;
        }
        .modal-items-table {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          overflow: hidden;
        }
        .modal-items-header {
          display: flex;
          padding: 8px 12px;
          background-color: var(--light-gray);
          font-weight: 700;
          color: var(--dark);
          border-bottom: 1px solid var(--border-color);
        }
        .modal-items-list {
          display: flex;
          flex-direction: column;
        }
        .modal-item-row {
          display: flex;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
        }
        .modal-item-row:last-child {
          border-bottom: none;
        }
        .modal-item-row > span:first-child {
          flex: 1;
        }
        .qty-col { width: 60px; text-align: center; }
        .price-col { width: 80px; text-align: right; }
        .total-col { width: 90px; text-align: right; font-weight: 600; }

        .modal-financial-breakdown {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-muted);
          border-top: 1px dashed var(--border-color);
          padding-top: 12px;
        }
        .finance-row {
          display: flex;
          justify-content: space-between;
          width: 220px;
        }
        .finance-row.grand-total {
          font-weight: 700;
          color: var(--dark);
          font-size: 1.05rem;
        }
      `}</style>
    </div>
  );
};
