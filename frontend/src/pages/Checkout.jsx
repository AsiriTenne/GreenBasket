import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { Spinner } from '../components/Loader';
import { CreditCard, ShoppingBag, ShieldCheck, Lock } from 'lucide-react';

export const Checkout = ({ setTab, setLastOrderDetails }) => {
  const { cartItems, subtotal, tax, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const [loading, setLoading] = useState(false);

  // Prefill details from authenticated user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Protect page: redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      setTab('cart');
    }
  }, [cartItems, setTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.address) {
      toast.error("Please fill in all required customer details.");
      return;
    }

    if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvv) {
      toast.error("Please provide simulated payment card details.");
      return;
    }

    setLoading(true);

    try {
      const itemsPayload = cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      const payload = {
        customer_name: formData.name,
        email: formData.email,
        address: formData.address,
        items: itemsPayload
      };

      const res = await api.post('/orders', payload);
      
      // Save order details to show on confirmation screen
      setLastOrderDetails({
        orderId: res.orderId,
        customerName: formData.name,
        email: formData.email,
        address: formData.address,
        total: total,
        items: cartItems
      });

      clearCart();
      toast.success("Order placed successfully!");
      setTab('confirmation');
    } catch (err) {
      toast.error(err.message || "Failed to process order checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container checkout-page anim-fade">
      <div className="section-header checkout-hdr">
        <h2>Secure Checkout</h2>
        <p>Complete your fresh organic food order safely</p>
      </div>

      <div className="checkout-layout">
        {/* Forms Side */}
        <form className="checkout-form-panel" onSubmit={handleSubmitOrder}>
          {/* Customer info card */}
          <div className="checkout-section-card glass-panel">
            <h3>1. Delivery Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Jane Doe"
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="jane.doe@example.com"
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Delivery Address *</label>
              <textarea 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="123 Main St, Apartment 4B, New York, NY 10001"
                rows="3"
                className="form-input textarea-input"
                required 
              ></textarea>
            </div>
          </div>

          {/* Payment info card */}
          <div className="checkout-section-card glass-panel">
            <div className="payment-title-row">
              <h3>2. Mock Payment Details</h3>
              <span className="badge badge-success"><Lock size={12} /> Secure Connection</span>
            </div>
            <p className="payment-note">
              This application is in developer demonstration mode. Please enter simulated card details (no actual funds will be charged).
            </p>

            <div className="form-group">
              <label className="form-label">Cardholder Name *</label>
              <input 
                type="text" 
                placeholder="Jane Doe" 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Number *</label>
              <div className="input-with-icon-wrapper">
                <CreditCard className="input-field-icon" size={18} />
                <input 
                  type="text" 
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="4111 2222 3333 4444" 
                  className="form-input input-with-icon" 
                  maxLength="19"
                  required 
                />
              </div>
            </div>

            <div className="payment-expiry-cvv">
              <div className="form-group">
                <label className="form-label">Expiry Date *</label>
                <input 
                  type="text" 
                  name="cardExpiry"
                  value={formData.cardExpiry}
                  onChange={handleChange}
                  placeholder="MM/YY" 
                  className="form-input" 
                  maxLength="5"
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">CVV *</label>
                <input 
                  type="password" 
                  name="cardCvv"
                  value={formData.cardCvv}
                  onChange={handleChange}
                  placeholder="•••" 
                  className="form-input" 
                  maxLength="4"
                  required 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-submit-order"
            disabled={loading}
          >
            {loading ? <Spinner size="small" color="#fff" /> : 'Authorize Payment & Place Order'}
          </button>
        </form>

        {/* Invoice Summary Side */}
        <aside className="checkout-summary-panel">
          <div className="summary-sticky-card glass-panel">
            <h3>Order Items</h3>
            
            <div className="checkout-items-preview">
              {cartItems.map((item) => (
                <div key={item.product.id} className="checkout-item-preview-row">
                  <span className="chk-item-qty">{item.quantity}x</span>
                  <span className="chk-item-name">{item.product.name}</span>
                  <span className="chk-item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="chk-summary-divider" />

            <div className="chk-invoice-rows">
              <div className="chk-invoice-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="chk-invoice-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="chk-invoice-row">
                <span>Shipping</span>
                <span className="shipping-free">FREE</span>
              </div>
              <hr className="chk-summary-divider" />
              <div className="chk-invoice-row chk-total-row">
                <span>Total Amount</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-trust-badge">
              <ShieldCheck size={20} className="trust-icon" />
              <span>Full buyer protection and refund guarantees included.</span>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .checkout-page {
          padding-top: 40px;
        }
        .checkout-hdr {
          margin-bottom: 30px;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 30px;
          align-items: start;
        }
        
        .checkout-form-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .checkout-section-card {
          padding: 24px;
        }
        .checkout-section-card h3 {
          font-size: 1.15rem;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          color: var(--dark);
        }
        
        .textarea-input {
          resize: vertical;
          font-family: inherit;
        }

        .payment-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }
        .payment-title-row h3 {
          border: none;
          margin: 0;
          padding: 0;
        }
        .payment-note {
          font-size: 0.8rem;
          color: var(--text-muted);
          background-color: var(--warning-bg);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          margin-bottom: 18px;
          border: 1px dashed hsla(45, 93%, 47%, 0.2);
        }
        .input-with-icon-wrapper {
          position: relative;
        }
        .input-field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .input-with-icon {
          padding-left: 42px;
        }

        .payment-expiry-cvv {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn-submit-order {
          width: 100%;
          padding: 14px;
          font-size: 1rem;
        }

        .checkout-summary-panel {
          position: sticky;
          top: 100px;
        }
        .summary-sticky-card {
          padding: 24px;
        }
        .summary-sticky-card h3 {
          font-size: 1.15rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          margin-bottom: 16px;
        }

        .checkout-items-preview {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 180px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
        .checkout-item-preview-row {
          display: flex;
          font-size: 0.875rem;
          gap: 8px;
        }
        .chk-item-qty {
          color: var(--primary);
          font-weight: 700;
        }
        .chk-item-name {
          color: var(--dark-light);
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .chk-item-price {
          color: var(--dark);
          font-weight: 600;
        }

        .chk-summary-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
          margin: 16px 0;
        }

        .chk-invoice-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chk-invoice-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .shipping-free {
          color: var(--success);
          font-weight: 700;
        }
        .chk-total-row {
          color: var(--dark);
          font-weight: 700;
          font-size: 1.15rem;
        }

        .checkout-trust-badge {
          display: flex;
          gap: 10px;
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 20px;
        }
        .trust-icon {
          color: var(--primary);
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
          .checkout-summary-panel {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};
