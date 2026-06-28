import { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '../services/dashboardService';

function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetchDashboardSummary();
        setSummary(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = summary?.metrics || {};

  return (
    <div className="stack">
      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="grid grid--3">
        <article className="card stat-card stat-card--sales">
          <h3>Total Sales</h3>
          <p>{loading ? '...' : formatCurrency(metrics.totalSales)}</p>
        </article>
        <article className="card stat-card stat-card--orders">
          <h3>Total Orders</h3>
          <p>{loading ? '...' : metrics.totalOrders ?? 0}</p>
        </article>
        <article className="card stat-card stat-card--customers">
          <h3>Customers</h3>
          <p>{loading ? '...' : metrics.totalCustomers ?? 0}</p>
        </article>
        <article className="card stat-card">
          <h3>Products</h3>
          <p>{loading ? '...' : metrics.totalProducts ?? 0}</p>
        </article>
        <article className="card stat-card">
          <h3>Categories</h3>
          <p>{loading ? '...' : metrics.totalCategories ?? 0}</p>
        </article>
        <article className="card stat-card stat-card--warning">
          <h3>Low Stock</h3>
          <p>{loading ? '...' : metrics.lowStock ?? 0}</p>
        </article>
      </div>

      <div className="grid grid--2">
        <section className="card">
          <div className="section-header">
            <h3>Recent Orders</h3>
          </div>
          {loading ? <p>Loading...</p> : (summary?.recentOrders || []).length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <ul className="item-list">
              {(summary?.recentOrders || []).map((order) => (
                <li key={order.id} className="item-list__row">
                  <div>
                    <strong>#{order.id}</strong>
                    <span className="muted"> — {order.first_name} {order.last_name}</span>
                  </div>
                  <div className="row-meta">
                    <span className={`status-badge status-badge--${order.status}`}>{order.status}</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <h3>Top Selling Products</h3>
          </div>
          {loading ? <p>Loading...</p> : (summary?.topSellingProducts || []).length === 0 ? (
            <p className="muted">No sales data yet.</p>
          ) : (
            <ul className="item-list">
              {(summary?.topSellingProducts || []).map((product) => (
                <li key={product.id} className="item-list__row">
                  <span>{product.name}</span>
                  <span>{product.totalSold} sold</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="section-header">
          <h3>Low Stock Alerts</h3>
        </div>
        {loading ? <p>Loading...</p> : (summary?.lowStockProducts || []).length === 0 ? (
          <p className="muted">All products are well stocked.</p>
        ) : (
          <ul className="item-list">
            {(summary?.lowStockProducts || []).map((product) => (
              <li key={product.id} className="item-list__row">
                <span>{product.name}</span>
                <span className="stock-warning">{product.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
