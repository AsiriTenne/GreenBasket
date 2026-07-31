import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { ProductSkeleton } from '../components/Loader';
import { toast } from '../components/Toast';
import { Search, ShoppingBag, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const Products = ({ 
  categoryFilter, 
  setCategoryFilter, 
  searchQuery, 
  setSearchQuery, 
  onProductSelect, 
  backendUrl = 'http://localhost:5005' 
}) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { addToCart } = useContext(CartContext);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products on filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit: 8,
          sort
        });

        if (searchQuery) queryParams.append('search', searchQuery);
        if (categoryFilter) queryParams.append('category', categoryFilter);

        const res = await api.get(`/products?${queryParams.toString()}`);
        setProducts(res.products);
        setTotalPages(res.pages);
        setTotalItems(res.total);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryFilter, searchQuery, sort, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchQuery, sort]);

  const handleCategorySelect = (slug) => {
    setCategoryFilter(slug);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
    toast.success(`Added ${product.name} to cart.`);
  };

  return (
    <div className="container products-page anim-fade">
      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className="products-sidebar glass-panel">
          <div className="sidebar-header-row">
            <SlidersHorizontal size={18} />
            <h3>Filter Items</h3>
          </div>

          <div className="filter-group-vertical">
            <h4>Category</h4>
            <button 
              className={`category-filter-btn ${categoryFilter === '' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('')}
            >
              <span className="cat-bullet"></span>
              All Categories
            </button>
            {categories.map((c) => (
              <button 
                key={c.id} 
                className={`category-filter-btn ${categoryFilter === c.slug ? 'active' : ''}`}
                onClick={() => handleCategorySelect(c.slug)}
              >
                <span className="cat-bullet"></span>
                {c.name}
                <span className="cat-count-pill">{c.product_count}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Catalog main display */}
        <main className="products-main">
          {/* Header Controls */}
          <div className="catalog-header glass-panel">
            <div className="results-count">
              Found <strong>{totalItems}</strong> organic goods
              {categoryFilter && <span> in <em>{categoryFilter}</em></span>}
            </div>

            <div className="sorting-wrapper">
              <ArrowUpDown size={16} className="sort-icon" />
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="sort-dropdown"
              >
                <option value="newest">Sort: Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <ProductSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="empty-catalog glass-panel">
              <svg viewBox="0 0 200 200" className="empty-state-svg">
                <circle cx="100" cy="100" r="80" fill="var(--light-gray)" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="6 6"/>
                <circle cx="100" cy="85" r="22" fill="none" stroke="var(--text-muted)" strokeWidth="3"/>
                <path d="M100 118 C70 118, 65 140, 65 140 L135 140 C135 140, 130 118, 100 118 Z" fill="none" stroke="var(--text-muted)" strokeWidth="3" stroke-linecap="round"/>
                <path d="M90 85 A2 2 0 1 1 88 85 A2 2 0 1 1 90 85" stroke="var(--text-muted)" strokeWidth="3"/>
                <path d="M112 85 A2 2 0 1 1 110 85 A2 2 0 1 1 112 85" stroke="var(--text-muted)" strokeWidth="3"/>
                <path d="M100 107 L100 112" stroke="var(--text-muted)" strokeWidth="3"/>
              </svg>
              <h3>No products found</h3>
              <p>We couldn't find anything matching your search. Try resetting filters or search query.</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setCategoryFilter('');
                  setSearchQuery('');
                }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {products.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div 
                      key={p.id} 
                      className="product-card glass-panel"
                      onClick={() => onProductSelect(p)}
                    >
                      <div className="prod-img-container">
                        <img 
                          src={p.image_url.startsWith('http') ? p.image_url : `${backendUrl}${p.image_url}`} 
                          alt={p.name} 
                          className="prod-img"
                        />
                        {p.featured === 1 && (
                          <span className="featured-tag">Featured</span>
                        )}
                      </div>
                      <div className="prod-info">
                        <div className="prod-meta">
                          <span className="prod-category">{p.category_name}</span>
                          <span className={`prod-stock-lbl ${isOutOfStock ? 'out' : p.stock < 10 ? 'low' : ''}`}>
                            {isOutOfStock ? 'Out of Stock' : p.stock < 10 ? `Only ${p.stock} left` : 'In Stock'}
                          </span>
                        </div>
                        <h3 className="prod-title">{p.name}</h3>
                        <div className="prod-footer">
                          <span className="prod-price">${p.price.toFixed(2)}</span>
                          <button 
                            className="btn btn-primary add-to-cart-small"
                            onClick={(e) => handleAddToCart(e, p)}
                            disabled={isOutOfStock}
                          >
                            <ShoppingBag size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination-wrapper glass-panel">
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={18} />
                    Prev
                  </button>
                  
                  <span className="pagination-text">
                    Page <strong>{page}</strong> of {totalPages}
                  </span>
                  
                  <button 
                    className="pagination-btn"
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        .products-page {
          padding-top: 40px;
        }
        .products-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 30px;
          align-items: start;
        }
        .products-sidebar {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          position: sticky;
          top: 100px;
        }
        .sidebar-header-row {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
          color: var(--dark);
        }
        .sidebar-header-row h3 {
          font-size: 1.1rem;
        }
        .filter-group-vertical {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .filter-group-vertical h4 {
          font-size: 0.9rem;
          color: var(--dark);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        .category-filter-btn {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          text-align: left;
          transition: var(--transition-fast);
        }
        .cat-bullet {
          width: 6px;
          height: 6px;
          background-color: var(--border-color);
          border-radius: 50%;
          margin-right: 10px;
          transition: var(--transition-fast);
        }
        .category-filter-btn:hover {
          background-color: var(--light-gray);
          color: var(--primary);
        }
        .category-filter-btn:hover .cat-bullet {
          background-color: var(--primary);
        }
        .category-filter-btn.active {
          background-color: var(--primary-glow);
          color: var(--primary);
          font-weight: 600;
        }
        .category-filter-btn.active .cat-bullet {
          background-color: var(--primary);
          transform: scale(1.5);
        }
        .cat-count-pill {
          margin-left: auto;
          font-size: 0.75rem;
          background-color: var(--light-gray);
          padding: 2px 6px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
        }
        .category-filter-btn.active .cat-count-pill {
          background-color: var(--white);
          color: var(--primary);
          border-color: var(--primary-glow);
        }

        .products-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
        }
        .results-count {
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .results-count strong {
          color: var(--dark);
        }
        .sorting-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sort-icon {
          color: var(--text-muted);
        }
        .sort-dropdown {
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--dark-light);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .sort-dropdown:focus {
          border-color: var(--primary);
          background-color: var(--white);
        }

        .empty-catalog {
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .empty-state-svg {
          width: 120px;
          height: 120px;
          margin-bottom: 8px;
        }
        .empty-catalog h3 {
          font-size: 1.5rem;
        }
        .empty-catalog p {
          max-width: 350px;
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin-top: 16px;
        }
        .pagination-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background-color: var(--white);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--dark-light);
          transition: var(--transition-fast);
        }
        .pagination-btn:hover:not(:disabled) {
          background-color: var(--light-gray);
          color: var(--primary);
          border-color: var(--primary);
        }
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination-text {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .pagination-text strong {
          color: var(--dark);
        }

        @media (max-width: 992px) {
          .products-layout {
            grid-template-columns: 1fr;
          }
          .products-sidebar {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
};
