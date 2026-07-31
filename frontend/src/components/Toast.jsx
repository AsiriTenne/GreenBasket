import React, { useState, useEffect } from 'react';

// Custom event name
const TOAST_EVENT = 'greenbasket-toast';

export const toast = {
  success: (message) => triggerToast(message, 'success'),
  error: (message) => triggerToast(message, 'danger'),
  info: (message) => triggerToast(message, 'info'),
  warning: (message) => triggerToast(message, 'warning')
};

function triggerToast(message, type) {
  const event = new CustomEvent(TOAST_EVENT, {
    detail: { id: Math.random().toString(36).substring(2, 9), message, type }
  });
  window.dispatchEvent(event);
}

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const { id, message, type } = e.detail;
      setToasts(prev => [...prev, { id, message, type }]);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-card toast-${t.type}`}>
          <div className="toast-icon">
            {t.type === 'success' && '✓'}
            {t.type === 'danger' && '✕'}
            {t.type === 'warning' && '⚠'}
            {t.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}>
            &times;
          </button>
        </div>
      ))}
      <style>{`
        .toast-card {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 280px;
          max-width: 400px;
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-lg);
          background-color: var(--white);
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
          overflow: hidden;
          border-left: 5px solid transparent;
        }

        .toast-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background-color: currentColor;
          opacity: 0.3;
          animation: shrinkProgress 3.5s linear forwards;
          transform-origin: left;
        }

        @keyframes shrinkProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        .toast-success {
          border-left-color: var(--success);
          color: var(--success);
          background-color: var(--success-bg);
        }

        .toast-danger {
          border-left-color: var(--danger);
          color: var(--danger);
          background-color: var(--danger-bg);
        }

        .toast-warning {
          border-left-color: var(--warning);
          color: var(--warning);
          background-color: var(--warning-bg);
        }

        .toast-info {
          border-left-color: var(--info);
          color: var(--info);
          background-color: var(--info-bg);
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .toast-message {
          color: var(--dark-light);
          font-weight: 500;
          font-size: 0.9rem;
          flex: 1;
        }

        .toast-close {
          color: var(--text-muted);
          font-size: 1.25rem;
          padding: 0 4px;
          line-height: 1;
          opacity: 0.6;
          transition: var(--transition-fast);
        }

        .toast-close:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
