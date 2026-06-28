import { useCallback, useEffect, useState } from 'react';
import { fetchCustomers, updateCustomer } from '../services/customerService';

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const loadCustomers = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchCustomers({ page: nextPage, limit: 10, search });
      setCustomers(response.data?.items || []);
      setPagination({
        totalPages: response.data?.totalPages || 1,
        total: response.data?.total || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load customers.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomers(page);
  }, [loadCustomers, page]);

  const handleToggleActive = async (customer) => {
    setSuccess('');
    try {
      await updateCustomer(customer.id, { isActive: !customer.is_active });
      setSuccess(`Customer ${customer.is_active ? 'deactivated' : 'activated'} successfully.`);
      loadCustomers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update customer.');
    }
  };

  return (
    <div className="stack">
      <div className="section-header">
        <div>
          <h2>Customers</h2>
          <p>{pagination.total} registered customers</p>
        </div>
      </div>

      <div className="filters card">
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="button" className="btn btn--primary" onClick={() => { setPage(1); loadCustomers(1); }}>Search</button>
      </div>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}

      <section className="card">
        {loading ? <p>Loading customers...</p> : customers.length === 0 ? (
          <p className="muted">No customers found.</p>
        ) : (
          <div className="table-list">
            {customers.map((customer) => (
              <article key={customer.id} className="table-list__row">
                <div>
                  <strong>{customer.first_name} {customer.last_name}</strong>
                  <p className="muted">{customer.email}</p>
                  <p className="muted">Joined {formatDate(customer.created_at)} · {customer.order_count} orders</p>
                </div>
                <div className="row-meta">
                  <span className={`status-badge ${customer.is_active ? 'status-badge--delivered' : 'status-badge--cancelled'}`}>
                    {customer.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    className={`btn ${customer.is_active ? 'btn--danger' : 'btn--primary'}`}
                    onClick={() => handleToggleActive(customer)}
                  >
                    {customer.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 ? (
          <div className="pagination">
            <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" className="btn btn--ghost" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
