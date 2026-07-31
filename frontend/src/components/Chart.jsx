import React from 'react';

// Line chart for Sales Overview
export const SalesLineChart = ({ data = [], labels = [] }) => {
  const width = 500;
  const height = 200;
  const padding = 30;

  const maxVal = Math.max(...data, 100) * 1.1;
  const points = data.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (data.length - 1 || 1);
    const y = height - padding - (val * (height - padding * 2)) / maxVal;
    return { x, y, val };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        {/* Grids */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        
        {/* Path line */}
        {points.length > 0 && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--primary)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="chart-path"
          />
        )}

        {/* Dots & Labels */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-dot-group">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="5" 
              fill="var(--white)" 
              stroke="var(--primary)" 
              strokeWidth="2.5" 
            />
            <text 
              x={p.x} 
              y={p.y - 10} 
              textAnchor="middle" 
              fontSize="10" 
              fontWeight="600"
              fill="var(--dark)"
              className="chart-val-label"
            >
              ${p.val.toFixed(0)}
            </text>
            <text 
              x={p.x} 
              y={height - 10} 
              textAnchor="middle" 
              fontSize="10" 
              fill="var(--text-muted)"
            >
              {labels[idx] || ''}
            </text>
          </g>
        ))}
      </svg>
      <style>{`
        .chart-wrapper {
          width: 100%;
          padding: 10px 0;
        }
        .svg-chart {
          width: 100%;
          height: auto;
          overflow: visible;
        }
        .chart-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawPath 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        .chart-dot-group circle {
          transition: r 0.2s ease;
          cursor: pointer;
        }
        .chart-dot-group:hover circle {
          r: 7;
          fill: var(--primary);
        }
        .chart-val-label {
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          transform: translateY(2px);
        }
        .chart-dot-group:hover .chart-val-label {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

// Bar chart for Orders per Month
export const OrdersBarChart = ({ data = [], labels = [] }) => {
  const width = 500;
  const height = 200;
  const padding = 30;
  const maxVal = Math.max(...data, 10) * 1.1;

  const barWidth = ((width - padding * 2) / data.length) * 0.65;
  const barSpacing = ((width - padding * 2) / data.length) * 0.35;

  return (
    <div className="chart-wrapper">
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-chart">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />

        {data.map((val, idx) => {
          const x = padding + idx * (barWidth + barSpacing) + barSpacing / 2;
          const barHeight = (val * (height - padding * 2)) / maxVal;
          const y = height - padding - barHeight;

          return (
            <g key={idx} className="chart-bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="var(--secondary)"
                rx="4"
                className="chart-rect"
              />
              <text 
                x={x + barWidth / 2} 
                y={y - 8} 
                textAnchor="middle" 
                fontSize="11" 
                fontWeight="700" 
                fill="var(--dark)"
                className="chart-bar-val"
              >
                {val}
              </text>
              <text 
                x={x + barWidth / 2} 
                y={height - 10} 
                textAnchor="middle" 
                fontSize="10" 
                fill="var(--text-muted)"
              >
                {labels[idx] || ''}
              </text>
            </g>
          );
        })}
      </svg>
      <style>{`
        .chart-rect {
          transform-origin: bottom;
          animation: scaleBar 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes scaleBar {
          from { transform: scaleY(0); y: ${height - padding}px; }
        }
        .chart-bar-group:hover rect {
          fill: var(--secondary-hover);
        }
        .chart-bar-val {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .chart-bar-group:hover .chart-bar-val {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

// Horizontal Bar chart for Top-Selling Products
export const TopProductsHorizontalChart = ({ products = [] }) => {
  const maxQty = Math.max(...products.map(p => p.qty), 5);

  return (
    <div className="top-products-chart">
      {products.map((p, idx) => {
        const pct = (p.qty / maxQty) * 100;
        return (
          <div key={idx} className="top-product-row">
            <div className="top-product-name-qty">
              <span className="prod-name">{p.name}</span>
              <span className="prod-qty">{p.qty} sold</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${pct}%`, backgroundColor: `hsl(172, 78%, ${30 + idx * 8}%)` }}
              ></div>
            </div>
          </div>
        );
      })}
      <style>{`
        .top-products-chart {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .top-product-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .top-product-name-qty {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .prod-name {
          color: var(--dark);
        }
        .prod-qty {
          color: var(--text-muted);
        }
        .progress-bar-bg {
          height: 10px;
          background-color: var(--light-gray);
          border-radius: var(--radius-full);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

// Segmented Bar / Donut breakdown for Category Revenue
export const CategoryRevenueDonut = ({ categories = [] }) => {
  const colors = [
    'var(--primary)',
    'var(--secondary)',
    '#3a86c8',
    '#d90429',
    '#7209b7',
    '#3f37c9'
  ];

  const totalRev = categories.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="cat-revenue-container">
      {totalRev === 0 ? (
        <div className="empty-chart-text">No revenue data recorded yet.</div>
      ) : (
        <>
          {/* Segmented GitHub-style bar */}
          <div className="segmented-bar">
            {categories.map((c, idx) => {
              const pct = totalRev > 0 ? (c.revenue / totalRev) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div 
                  key={idx} 
                  className="bar-segment" 
                  style={{ 
                    width: `${pct}%`, 
                    backgroundColor: colors[idx % colors.length] 
                  }}
                  title={`${c.name}: $${c.revenue.toFixed(2)} (${pct.toFixed(1)}%)`}
                ></div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="cat-legend-grid">
            {categories.map((c, idx) => {
              const pct = totalRev > 0 ? (c.revenue / totalRev) * 100 : 0;
              return (
                <div key={idx} className="legend-item">
                  <span 
                    className="legend-color-dot" 
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  ></span>
                  <span className="legend-name">{c.name}</span>
                  <span className="legend-val">${c.revenue.toFixed(2)} ({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <style>{`
        .cat-revenue-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .empty-chart-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          text-align: center;
          padding: 20px;
        }
        .segmented-bar {
          display: flex;
          height: 16px;
          border-radius: var(--radius-full);
          overflow: hidden;
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
        }
        .bar-segment {
          height: 100%;
          transition: width 0.8s ease;
        }
        .cat-legend-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.825rem;
        }
        .legend-color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .legend-name {
          font-weight: 600;
          color: var(--dark);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .legend-val {
          color: var(--text-muted);
          margin-left: auto;
          font-weight: 500;
        }
        @media (max-width: 480px) {
          .cat-legend-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
