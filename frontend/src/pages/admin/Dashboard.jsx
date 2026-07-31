import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { Spinner } from '../../components/Loader';
import { 
  SalesLineChart, 
  OrdersBarChart, 
  TopProductsHorizontalChart, 
  CategoryRevenueDonut 
} from '../../components/Chart';
import { 
  ShoppingBag, 
  Tag, 
  Users, 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  TrendingUp 
} from 'lucide-react';

export const Dashboard = ({ setTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuickReplenish = async (productId, currentStock) => {
    try {
      const addedQty = 10;
      await api.put(`/products/${productId}`, { stock: currentStock + addedQty });
      toast.success(`Replenished +${addedQty} items successfully.`);
      fetchStats(); // reload stats
    } catch (err) {
      toast.error("Failed to replenish stock.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner size="large" />
        <p>Analyzing store metrics...</p>
      </div>
    );
  }

  const { kpis, lowStockAlerts, topProducts, categoryRevenue, monthlyCharts } = stats;

  return (
    <div className="admin-dashboard-page anim-fade">
      {/* Page Title */}
      <div className="dashboard-header-row">
        <div>
          <h2>Executive Dashboard</h2>
          <p>Real-time analytics, inventory statuses, and revenue trackers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setTab('admin-products')}>
          <Plus size={16} /> Manage Catalog
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpis-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-row">
            <div className="kpi-icon-wrapper kpi-products"><ShoppingBag size={22} /></div>
            <span className="kpi-title">Total Products</span>
          </div>
          <div className="kpi-value">{kpis.totalProducts}</div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-row">
            <div className="kpi-icon-wrapper kpi-categories"><Tag size={22} /></div>
            <span className="kpi-title">Total Categories</span>
          </div>
          <div className="kpi-value">{kpis.totalCategories}</div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-row">
            <div className="kpi-icon-wrapper kpi-users"><Users size={22} /></div>
            <span className="kpi-title">Total Users</span>
          </div>
          <div className="kpi-value">{kpis.totalUsers}</div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-row">
            <div className="kpi-icon-wrapper kpi-orders"><CreditCard size={22} /></div>
            <span className="kpi-title">Total Orders</span>
          </div>
          <div className="kpi-value">{kpis.totalOrders}</div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-row">
            <div className="kpi-icon-wrapper kpi-revenue"><DollarSign size={22} /></div>
            <span className="kpi-title">Gross Revenue</span>
          </div>
          <div className="kpi-value">${kpis.revenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-layout">
        {/* Line Chart */}
        <div className="dashboard-chart-card glass-panel">
          <div className="card-hdr">
            <h3>Sales Overview</h3>
            <span className="card-lbl-trending"><TrendingUp size={14} /> +12% vs last month</span>
          </div>
          <SalesLineChart data={monthlyCharts.sales} labels={monthlyCharts.labels} />
        </div>

        {/* Bar Chart */}
        <div className="dashboard-chart-card glass-panel">
          <div className="card-hdr">
            <h3>Orders Volume</h3>
          </div>
          <OrdersBarChart data={monthlyCharts.orders} labels={monthlyCharts.labels} />
        </div>
      </div>

      <div className="charts-grid-layout secondary-charts">
        {/* Top Products */}
        <div className="dashboard-chart-card glass-panel">
          <div className="card-hdr">
            <h3>Top-Selling Products</h3>
          </div>
          <TopProductsHorizontalChart products={topProducts} />
        </div>

        {/* Category Revenue */}
        <div className="dashboard-chart-card glass-panel">
          <div className="card-hdr">
            <h3>Revenue by Category</h3>
          </div>
          <CategoryRevenueDonut categories={categoryRevenue} />
        </div>
      </div>

      {/* Low-Stock Alerts Panel */}
      <div className="low-stock-panel-section glass-panel">
        <div className="panel-hdr">
          <div className="panel-title-group">
            <AlertTriangle className="alert-icon" size={20} />
            <h3>Low Stock Inventory Alerts</h3>
          </div>
          {lowStockAlerts.length > 0 && (
            <span className="badge badge-danger">{lowStockAlerts.length} Warnings Active</span>
          )}
        </div>

        {lowStockAlerts.length === 0 ? (
          <div className="no-alerts-placeholder">
            <span>✓</span> All product stock levels are stable and fully supplied.
          </div>
        ) : (
          <div className="alerts-table-container">
            <table className="alerts-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Quantity Remaining</th>
                  <th>Status</th>
                  <th className="action-col">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {lowStockAlerts.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category_name}</td>
                    <td>
                      <span className={`stock-count ${p.stock === 0 ? 'empty' : 'warning-txt'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {p.stock === 0 ? 'Out of Stock' : 'Critical Stock'}
                      </span>
                    </td>
                    <td className="action-col">
                      <button 
                        className="btn btn-secondary quick-add-stock-btn"
                        onClick={() => handleQuickReplenish(p.id, p.stock)}
                      >
                        Replenish +10
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .dashboard-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .dashboard-header-row h2 {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }
        .dashboard-header-row p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 0;
          gap: 16px;
          color: var(--text-muted);
        }

        .kpis-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
        }
        .kpi-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .kpi-icon-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .kpi-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .kpi-value {
          font-size: 1.6rem;
          font-family: var(--font-heading);
          font-weight: 800;
          color: var(--dark);
        }
        .kpi-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kpi-products { background-color: hsla(200, 80%, 40%, 0.1); color: var(--info); }
        .kpi-categories { background-color: hsla(36, 96%, 48%, 0.1); color: var(--secondary); }
        .kpi-users { background-color: hsla(280, 80%, 40%, 0.1); color: #7209b7; }
        .kpi-orders { background-color: hsla(150, 84%, 25%, 0.1); color: var(--success); }
        .kpi-revenue { background-color: var(--primary-glow); color: var(--primary); }

        .charts-grid-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        .dashboard-chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .card-hdr h3 {
          font-size: 1.1rem;
        }
        .card-lbl-trending {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--success);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .low-stock-panel-section {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .panel-hdr {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .panel-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--danger);
        }
        .panel-title-group h3 {
          color: var(--dark);
          font-size: 1.15rem;
        }
        .no-alerts-placeholder {
          background-color: var(--success-bg);
          color: var(--success);
          padding: 14px 20px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
        }
        .no-alerts-placeholder span {
          font-size: 1.1rem;
          margin-right: 6px;
        }
        .alerts-table-container {
          overflow-x: auto;
        }
        .alerts-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }
        .alerts-table th, .alerts-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        .alerts-table th {
          font-weight: 700;
          color: var(--dark);
          background-color: var(--light-gray);
        }
        .stock-count.warning-txt {
          color: var(--warning);
          font-weight: 700;
        }
        .stock-count.empty {
          color: var(--danger);
          font-weight: 800;
        }
        .quick-add-stock-btn {
          padding: 6px 12px;
          font-size: 0.8rem;
        }

        @media (max-width: 1200px) {
          .kpis-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .kpis-grid {
            grid-template-columns: 1fr 1fr;
          }
          .charts-grid-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .dashboard-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
        }
        @media (max-width: 480px) {
          .kpis-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
