import React from 'react';

export const Spinner = ({ size = 'medium', color = 'var(--primary)' }) => {
  const sizePx = size === 'small' ? '20px' : size === 'large' ? '48px' : '32px';
  const borderPx = size === 'small' ? '2px' : size === 'large' ? '5px' : '3.5px';

  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <style>{`
        .spinner-container {
          display: inline-flex;
          justify-content: center;
          align-items: center;
        }
        .spinner {
          width: ${sizePx};
          height: ${sizePx};
          border: ${borderPx} solid var(--border-color);
          border-top: ${borderPx} solid ${color};
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export const ProductSkeleton = ({ count = 4 }) => {
  return (
    <div className="cards-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-img"></div>
          <div className="skeleton-details">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-meta"></div>
            <div className="skeleton-footer">
              <div className="skeleton skeleton-price"></div>
              <div className="skeleton skeleton-btn"></div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        .skeleton-card {
          background-color: var(--white);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .skeleton-img {
          height: 180px;
          border-radius: var(--radius-sm);
        }
        .skeleton-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .skeleton-title {
          height: 20px;
          width: 80%;
        }
        .skeleton-meta {
          height: 14px;
          width: 50%;
        }
        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
        }
        .skeleton-price {
          height: 24px;
          width: 60px;
        }
        .skeleton-btn {
          height: 36px;
          width: 100px;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="table-skeleton-container">
      <div className="skeleton-thead">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton skeleton-header-col"></div>
        ))}
      </div>
      <div className="skeleton-tbody">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-row">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="skeleton skeleton-cell"></div>
            ))}
          </div>
        ))}
      </div>
      <style>{`
        .table-skeleton-container {
          background-color: var(--white);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          padding: 12px;
        }
        .skeleton-thead {
          display: flex;
          gap: 20px;
          padding: 14px 20px;
          background-color: var(--light-gray);
          border-bottom: 1px solid var(--border-color);
        }
        .skeleton-header-col {
          height: 16px;
          flex: 1;
        }
        .skeleton-row {
          display: flex;
          gap: 20px;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }
        .skeleton-row:last-child {
          border-bottom: none;
        }
        .skeleton-cell {
          height: 20px;
          flex: 1;
        }
      `}</style>
    </div>
  );
};
