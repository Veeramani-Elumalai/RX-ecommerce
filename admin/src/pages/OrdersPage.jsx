import { useCallback, useEffect, useState } from 'react';
import { fetchOrders, updateOrder } from '../services/orderService';

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'failed', 'refunded'];

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const loadOrders = useCallback(async (page = filters.page) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchOrders({ ...filters, page, limit: 10 });
      setOrders(response.data?.items || []);
      setPagination({
        totalPages: response.data?.totalPages || 1,
        total: response.data?.total || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId, field, value) => {
    setSuccess('');
    try {
      await updateOrder(orderId, { [field]: value });
      setSuccess('Order updated successfully.');
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update order.');
    }
  };

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <h2>Orders</h2>
          <p>{pagination.total} total orders</p>
        </div>
      </div>

      <div className="filters card">
        <input
          className="search-input"
          placeholder="Search by order ID or customer..."
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
        />
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="button" className="btn btn--primary" onClick={() => loadOrders(1)}>Search</button>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}

      <section className="card">
        {loading ? <p>Loading orders...</p> : orders.length === 0 ? (
          <p className="muted">No orders found.</p>
        ) : (
          <div className="table-list">
            {orders.map((order) => (
              <article key={order.id} className="table-list__row order-row">
                <div className="order-row__main">
                  <strong>Order #{order.id}</strong>
                  <p className="muted">{order.first_name} {order.last_name} — {order.email}</p>
                  <p className="muted">{formatDate(order.created_at)}</p>
                </div>
                <div className="order-row__amount">{formatCurrency(order.total_amount)}</div>
                <div className="order-row__controls">
                  <select
                    value={order.status}
                    onChange={(event) => handleStatusChange(order.id, 'status', event.target.value)}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={order.payment_status}
                    onChange={(event) => handleStatusChange(order.id, 'paymentStatus', event.target.value)}
                  >
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 ? (
          <div className="pagination">
            <button type="button" className="btn btn--ghost" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
            <span>Page {filters.page} of {pagination.totalPages}</span>
            <button type="button" className="btn btn--ghost" disabled={filters.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
