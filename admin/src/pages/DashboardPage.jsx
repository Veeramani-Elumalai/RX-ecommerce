import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/categoryService';
import { fetchProducts } from '../services/productService';

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetchProducts({ page: 1, limit: 5 }),
          fetchCategories(),
        ]);

        setProducts(productsResponse.data?.items || productsResponse.data || []);
        setCategories(categoriesResponse.data || []);
        setStats({
          products: productsResponse.data?.total || (productsResponse.data || []).length,
          categories: Array.isArray(categoriesResponse.data) ? categoriesResponse.data.length : 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="stack">
      <div className="grid grid--3">
        <article className="card stat-card">
          <h3>Products</h3>
          <p>{loading ? 'Loading...' : stats.products}</p>
        </article>
        <article className="card stat-card">
          <h3>Categories</h3>
          <p>{loading ? 'Loading...' : stats.categories}</p>
        </article>
        <article className="card stat-card">
          <h3>Inventory</h3>
          <p>{loading ? 'Loading...' : products.reduce((sum, product) => sum + Number(product.stock || 0), 0)}</p>
        </article>
      </div>
      <div className="grid grid--2">
        <section className="card">
          <div className="section-header">
            <h3>Recent Products</h3>
          </div>
          {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products yet.</p> : (
            <ul className="item-list">
              {products.map((product) => (
                <li key={product.id} className="item-list__row">
                  <span>{product.name}</span>
                  <span>${Number(product.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <div className="section-header">
            <h3>Recent Categories</h3>
          </div>
          {loading ? <p>Loading...</p> : categories.length === 0 ? <p>No categories yet.</p> : (
            <ul className="item-list">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id} className="item-list__row">
                  <span>{category.name}</span>
                  <span>{category.slug}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
