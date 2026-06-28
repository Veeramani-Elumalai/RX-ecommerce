import { useCallback, useEffect, useMemo, useState } from 'react';
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/productService';
import { fetchCategories } from '../services/categoryService';

const emptyProduct = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  image: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchProducts({ page, limit: 10, search, category: categoryFilter, sortBy, sortOrder });
      const payload = response.data || {};
      setProducts(payload.items || []);
      setPagination({ total: payload.total || 0, totalPages: payload.totalPages || 1, limit: payload.limit || 10 });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories().then((response) => setCategories(response.data || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, [loadProducts]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== '') {
        payload.append(key, value);
      }
    });

    if (selectedFile) {
      payload.append('image', selectedFile);
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setSuccess('Product updated');
      } else {
        await createProduct(payload);
        setSuccess('Product created');
      }

      setForm(emptyProduct);
      setEditingId(null);
      setSelectedFile(null);
      setPreviewUrl('');
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.category_id,
      image: product.image || '',
    });
    setPreviewUrl(product.image || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      setSuccess('Product deleted');
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete product');
    }
  };

  const filteredProducts = useMemo(() => products, [products]);

  return (
    <div className="stack">
      {error ? <div className="alert alert--error">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}
      <div className="grid grid--2">
        <section className="card">
          <div className="section-header">
            <h3>{editingId ? 'Edit Product' : 'Create Product'}</h3>
          </div>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <div className="grid grid--2">
              <label className="field">
                <span>Slug</span>
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
              </label>
              <label className="field">
                <span>SKU</span>
                <input value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} required />
              </label>
            </div>
            <label className="field">
              <span>Description</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <div className="grid grid--2">
              <label className="field">
                <span>Price</span>
                <input type="number" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              </label>
              <label className="field">
                <span>Stock</span>
                <input type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
              </label>
            </div>
            <label className="field">
              <span>Category</span>
              <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
                <option value="">Select a category</option>
                {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
              </select>
            </label>
            <label className="field">
              <span>Image</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setPreviewUrl(file ? URL.createObjectURL(file) : form.image || '');
              }} />
            </label>
            {previewUrl ? <img className="preview-image" src={previewUrl} alt="Product preview" /> : null}
            <div className="actions">
              <button type="submit" className="btn btn--primary">{editingId ? 'Update' : 'Create'}</button>
              {editingId ? <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(emptyProduct); setPreviewUrl(''); setSelectedFile(null); }}>Cancel</button> : null}
            </div>
          </form>
        </section>
        <section className="card">
          <div className="section-header">
            <h3>Products</h3>
            <div className="filters">
              <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="">All categories</option>
                {categories.map((category) => (<option key={category.id} value={category.id}>{category.name}</option>))}
              </select>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="created_at">Newest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          {loading ? <p>Loading...</p> : filteredProducts.length === 0 ? <p>No products found.</p> : (
            <div className="table-list">
              {filteredProducts.map((product) => (
                <div key={product.id} className="table-list__row">
                  <div>
                    <strong>{product.name}</strong>
                    <p>{product.sku} • {product.category_name || product.category_name}</p>
                  </div>
                  <div className="actions">
                    <button type="button" className="btn btn--ghost" onClick={() => handleEdit(product)}>Edit</button>
                    <button type="button" className="btn btn--danger" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="pagination">
            <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
            <span>Page {page} of {pagination.totalPages}</span>
            <button type="button" className="btn btn--ghost" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </section>
      </div>
    </div>
  );
}
