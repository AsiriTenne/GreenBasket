import React from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container anim-slide-up" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease forwards;
        }

        .modal-container {
          background-color: var(--white);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          width: 90%;
          max-width: 550px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-close-btn {
          font-size: 1.75rem;
          color: var(--text-muted);
          transition: var(--transition-fast);
          line-height: 1;
        }

        .modal-close-btn:hover {
          color: var(--dark);
        }

        .modal-content {
          padding: 24px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', loading = false }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-modal-body">
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
      <style>{`
        .confirm-message {
          font-size: 0.975rem;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </Modal>
  );
};

export const ProductDetailsModal = ({ isOpen, onClose, product, onAddToCart, backendUrl = API_BASE_URL.replace('/api', '') }) => {
  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name}>
      <div className="product-detail-modal">
        <div className="product-detail-img-container">
          <img 
            src={product.image_url.startsWith('http') ? product.image_url : `${backendUrl}${product.image_url}`} 
            alt={product.name} 
            className="product-detail-img"
          />
          {product.featured === 1 && (
            <span className="featured-ribbon">Featured</span>
          )}
        </div>
        <div className="product-detail-info">
          <div className="product-detail-meta">
            <span className="badge badge-info">{product.category_name || 'General'}</span>
            <span className={`badge ${isOutOfStock ? 'badge-danger' : product.stock < 10 ? 'badge-warning' : 'badge-success'}`}>
              {isOutOfStock ? 'Out of Stock' : product.stock < 10 ? `Low Stock (${product.stock} left)` : 'In Stock'}
            </span>
          </div>
          
          <div className="product-detail-price">${product.price.toFixed(2)}</div>
          
          <p className="product-detail-desc">{product.description || 'No description available for this product.'}</p>
          
          <div className="product-detail-actions">
            <button 
              className="btn btn-primary add-to-cart-big" 
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .product-detail-modal {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .product-detail-img-container {
          position: relative;
          width: 100%;
          height: 240px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
        }
        .product-detail-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .featured-ribbon {
          position: absolute;
          top: 12px;
          right: 12px;
          background-color: var(--secondary);
          color: var(--white);
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-sm);
        }
        .product-detail-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .product-detail-meta {
          display: flex;
          gap: 10px;
        }
        .product-detail-price {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--dark);
          font-family: var(--font-heading);
        }
        .product-detail-desc {
          color: var(--dark-light);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .product-detail-actions {
          margin-top: 10px;
        }
        .add-to-cart-big {
          width: 100%;
          padding: 14px;
        }
      `}</style>
    </Modal>
  );
};
