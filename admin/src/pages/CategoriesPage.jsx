import { useCallback, useEffect, useMemo, useState } from 'react';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../services/categoryService';

const emptyCategory = { name: '', slug: '', description: '', image: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const filteredCategories = useMemo(() => categories.filter((category) => `${category.name} ${category.slug}`.toLowerCase().includes(search.toLowerCase())), [categories, search]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await updateCategory(editingId, form);
        setSuccess('Category updated');
      } else {
        await createCategory(form);
        setSuccess('Category created');
      }

      setForm(emptyCategory);
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, slug: category.slug, description: category.description || '', image: category.image || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) {
      return;
    }

    try {
      await deleteCategory(id);
      setSuccess('Category deleted');
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete category');
    }
  };

  return (
    <div className="stack">
      {error ? <div className="alert alert--error">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}
      <div className="grid grid--2">
        <section className="card">
          <div className="section-header">
            <h3>{editingId ? 'Edit Category' : 'Create Category'}</h3>
          </div>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label className="field">
              <span>Slug</span>
              <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} required />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </label>
            <label className="field">
              <span>Image</span>
              <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
            </label>
            <div className="actions">
              <button type="submit" className="btn btn--primary">{editingId ? 'Update' : 'Create'}</button>
              {editingId ? <button type="button" className="btn btn--ghost" onClick={() => { setEditingId(null); setForm(emptyCategory); }}>Cancel</button> : null}
            </div>
          </form>
        </section>
        <section className="card">
          <div className="section-header">
            <h3>Categories</h3>
            <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" />
          </div>
          {loading ? <p>Loading...</p> : filteredCategories.length === 0 ? <p>No categories found.</p> : (
            <div className="table-list">
              {filteredCategories.map((category) => (
                <div key={category.id} className="table-list__row">
                  <div>
                    <strong>{category.name}</strong>
                    <p>{category.slug}</p>
                  </div>
                  <div className="actions">
                    <button type="button" className="btn btn--ghost" onClick={() => handleEdit(category)}>Edit</button>
                    <button type="button" className="btn btn--danger" onClick={() => handleDelete(category.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
