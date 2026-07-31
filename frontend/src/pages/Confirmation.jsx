import React from 'react';
import { CheckCircle2, Package, Calendar, Home, ArrowRight } from 'lucide-react';

export const Confirmation = ({ setTab, orderDetails }) => {
  // Fallback if accessed by accident or refresh (without details)
  if (!orderDetails) {
    return (
      <div className="container confirmation-page error-page anim-fade">
        <div className="error-card glass-panel">
          <h2>Oops!</h2>
          <p>No recent order details were found. You might have refreshed the page.</p>
          <button className="btn btn-primary" onClick={() => setTab('home')}>
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container confirmation-page anim-fade">
      <div className="conf-card glass-panel">
        <div className="success-banner">
          <CheckCircle2 className="success-icon" size={60} />
          <h2>Order Confirmed!</h2>
          <p>Thank you for shopping with GreenBasket. Your organic items are being prepared.</p>
        </div>

        {/* Invoice Summary Metadata */}
        <div className="metadata-box">
          <div className="meta-item">
            <span className="meta-lbl">Order Number</span>
            <span className="meta-val">#FC-00{orderDetails.orderId}</span>
          </div>
          <div className="meta-item">
            <span className="meta-lbl">Date Placed</span>
            <span className="meta-val">{currentDate}</span>
          </div>
          <div className="meta-item">
            <span className="meta-lbl">Estimated Delivery</span>
            <span className="meta-val">Tomorrow, before 6 PM</span>
          </div>
        </div>

        {/* Address and Details Info */}
        <div className="details-grid">
          <div className="details-card">
            <h4>Delivery Address</h4>
            <p className="address-text">{orderDetails.address}</p>
          </div>
          <div className="details-card">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> {orderDetails.customerName}</p>
            <p><strong>Email:</strong> {orderDetails.email}</p>
            <p><strong>Shipping:</strong> Express Handpicked Delivery</p>
          </div>
        </div>

        {/* Items Bought List */}
        <div className="order-items-preview-box">
          <h4>Items Ordered</h4>
          <div className="order-preview-list">
            {orderDetails.items.map((item) => (
              <div key={item.product.id} className="order-preview-row">
                <span className="item-preview-qty">{item.quantity}x</span>
                <span className="item-preview-name">{item.product.name}</span>
                <span className="item-preview-price">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-preview-total">
            <span>Total Paid</span>
            <span className="preview-total-val">${orderDetails.total.toFixed(2)}</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="conf-actions">
          <button className="btn btn-secondary btn-home-conf" onClick={() => setTab('products')}>
            Shop More Items
          </button>
          <button className="btn btn-primary btn-profile-conf" onClick={() => setTab('profile')}>
            Track in My Orders <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <style>{`
        .confirmation-page {
          padding-top: 40px;
          display: flex;
          justify-content: center;
        }
        .conf-card {
          width: 100%;
          max-width: 650px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .success-banner {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .success-icon {
          color: var(--success);
        }
        .success-banner h2 {
          font-size: 1.85rem;
          color: var(--dark);
        }
        .success-banner p {
          color: var(--text-muted);
          font-size: 0.95rem;
          max-width: 420px;
        }

        .metadata-box {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 16px 20px;
          border-radius: var(--radius-sm);
          text-align: center;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .meta-lbl {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .meta-val {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--dark);
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .details-card h4 {
          font-size: 0.95rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
          margin-bottom: 10px;
          color: var(--dark);
        }
        .details-card p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .address-text {
          font-style: italic;
        }

        .order-items-preview-box h4 {
          font-size: 0.95rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
          margin-bottom: 12px;
          color: var(--dark);
        }
        .order-preview-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .order-preview-row {
          display: flex;
          font-size: 0.85rem;
          gap: 8px;
        }
        .item-preview-qty {
          color: var(--primary);
          font-weight: 700;
        }
        .item-preview-name {
          color: var(--dark-light);
          flex: 1;
        }
        .item-preview-price {
          color: var(--dark);
          font-weight: 600;
        }
        .order-preview-total {
          border-top: 1px dashed var(--border-color);
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          font-weight: 700;
          font-size: 1rem;
          color: var(--dark);
        }
        .preview-total-val {
          color: var(--primary);
        }

        .conf-actions {
          display: flex;
          gap: 16px;
        }
        .btn-home-conf {
          flex: 1;
        }
        .btn-profile-conf {
          flex: 1.2;
        }

        .error-card {
          padding: 40px;
          text-align: center;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }

        @media (max-width: 576px) {
          .metadata-box {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .details-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .conf-actions {
            flex-direction: column;
          }
          .conf-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};
