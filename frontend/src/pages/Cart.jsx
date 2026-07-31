import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { toast } from '../components/Toast';

export const Cart = ({ setTab, backendUrl = API_BASE_URL.replace('/api', '') }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    tax, 
    total 
  } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const handleCheckoutClick = () => {
    if (!user) {
      toast.info("Please sign in or register to complete your purchase.");
      setTab('login');
    } else {
      setTab('checkout');
    }
  };

  const handleRemoveItem = (productId, name) => {
    removeFromCart(productId);
    toast.success(`Removed ${name} from cart.`);
  };

  return (
    <div className="container cart-page anim-fade">
      <div className="section-header cart-header-sec">
        <h2>Your Shopping Cart</h2>
        <p>Review items and adjust quantities before placing order</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-container glass-panel">
          <svg viewBox="0 0 200 200" className="empty-cart-svg">
            <circle cx="100" cy="100" r="80" fill="var(--light-gray)" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="6 6"/>
            {/* Grid base cart */}
            <path d="M50 70 H60 L75 130 H140 L155 70 Z" fill="none" stroke="var(--text-muted)" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M45 55 H55 L60 70" fill="none" stroke="var(--text-muted)" strokeWidth="3" stroke-linecap="round"/>
            {/* Wheels */}
            <circle cx="85" cy="150" r="10" fill="none" stroke="var(--text-muted)" strokeWidth="3"/>
            <circle cx="130" cy="150" r="10" fill="none" stroke="var(--text-muted)" strokeWidth="3"/>
          </svg>
          <h3>Your cart is empty</h3>
          <p>Explore our organic vegetables, fresh fruits, cakes, and cookies to fill it up!</p>
          <button className="btn btn-primary" onClick={() => setTab('products')}>
            Shop Organic Items
          </button>
        </div>
      ) : (
        <div className="cart-grid">
          {/* Cart Items List */}
          <div className="cart-items-panel glass-panel">
            <div className="cart-panel-header">
              <h3>Cart Items ({cartItems.length})</h3>
              <button className="btn-clear-cart" onClick={() => { clearCart(); toast.success("Cart cleared."); }}>
                Empty Cart
              </button>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.product.id} className="cart-item-row">
                  <img 
                    src={item.product.image_url.startsWith('http') ? item.product.image_url : `${backendUrl}${item.product.image_url}`} 
                    alt={item.product.name} 
                    className="cart-item-img"
                  />
                  
                  <div className="cart-item-info">
                    <h4 className="cart-item-title">{item.product.name}</h4>
                    <span className="cart-item-category">{item.product.category_name}</span>
                    <span className="cart-item-price-each">${item.product.price.toFixed(2)} each</span>
                  </div>

                  <div className="cart-item-qty-actions">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="qty-number">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="cart-item-subtotal-delete">
                    <span className="cart-item-subtotal-price">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      className="btn-delete-item"
                      onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                      title="Remove product"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="cart-summary-panel glass-panel">
            <h3>Order Summary</h3>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="shipping-badge-free">FREE</span>
              </div>
              
              <hr className="summary-divider" />
              
              <div className="summary-row total-row">
                <span>Grand Total</span>
                <span className="grand-total-price">${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary checkout-btn" onClick={handleCheckoutClick}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <button className="btn btn-secondary continue-shopping-btn" onClick={() => setTab('products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <style>{`
        .cart-page {
          padding-top: 40px;
        }
        .cart-header-sec {
          margin-bottom: 30px;
        }
        .empty-cart-container {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-cart-svg {
          width: 130px;
          height: 130px;
          margin-bottom: 8px;
        }
        .empty-cart-container h3 {
          font-size: 1.5rem;
        }
        .empty-cart-container p {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 8px;
          max-width: 380px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 30px;
          align-items: start;
        }
        
        .cart-items-panel {
          padding: 24px;
        }
        .cart-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .btn-clear-cart {
          font-size: 0.85rem;
          color: var(--danger);
          font-weight: 600;
          transition: var(--transition-fast);
        }
        .btn-clear-cart:hover {
          opacity: 0.8;
        }

        .cart-items-list {
          display: flex;
          flex-direction: column;
        }
        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
        }
        .cart-item-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .cart-item-img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          background-color: var(--light-gray);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }
        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cart-item-title {
          font-size: 1rem;
          color: var(--dark);
        }
        .cart-item-category {
          font-size: 0.75rem;
          color: var(--primary);
          text-transform: uppercase;
          font-weight: 600;
        }
        .cart-item-price-each {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        
        .cart-item-qty-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 4px;
          background-color: var(--light-gray);
        }
        .qty-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background-color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--dark-light);
          box-shadow: var(--shadow-sm);
          transition: var(--transition-fast);
        }
        .qty-btn:hover:not(:disabled) {
          background-color: var(--primary);
          color: var(--white);
        }
        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .qty-number {
          font-size: 0.9rem;
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }

        .cart-item-subtotal-delete {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 120px;
          justify-content: flex-end;
        }
        .cart-item-subtotal-price {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--dark);
        }
        .btn-delete-item {
          color: var(--text-muted);
          transition: var(--transition-fast);
          padding: 4px;
        }
        .btn-delete-item:hover {
          color: var(--danger);
        }

        .cart-summary-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .cart-summary-panel h3 {
          font-size: 1.2rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .shipping-badge-free {
          color: var(--success);
          font-weight: 700;
        }
        .summary-divider {
          border: 0;
          border-top: 1px solid var(--border-color);
        }
        .total-row {
          color: var(--dark);
          font-weight: 600;
        }
        .grand-total-price {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary);
        }
        .checkout-btn {
          width: 100%;
          padding: 14px;
        }
        .continue-shopping-btn {
          width: 100%;
          padding: 12px;
        }

        @media (max-width: 992px) {
          .cart-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 576px) {
          .cart-item-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            position: relative;
          }
          .cart-item-subtotal-delete {
            width: 100%;
            justify-content: space-between;
            border-top: 1px dashed var(--border-color);
            padding-top: 12px;
            margin-top: 4px;
          }
          .cart-item-qty-actions {
            align-self: flex-end;
            position: absolute;
            top: 16px;
            right: 0;
          }
        }
      `}</style>
    </div>
  );
};
