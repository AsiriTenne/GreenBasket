import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../../utils/api';
import { toast } from '../../components/Toast';
import { Spinner, TableSkeleton } from '../../components/Loader';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export const AdminProducts = () => {
  const backendUrl = API_BASE_URL.replace('/api', '');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Paging
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null means "Create" mode
  const [submitLoading, setSubmitLoading] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form inputs state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    featured: false,
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 8,
        include_inactive: 'true',
        search,
        category: categoryFilter
      });

      const res = await api.get(`/products?${queryParams.toString()}`);
      setProducts(res.products);
      setTotalPages(res.pages);
    } catch (err) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      featured: false,
      status: 'active'
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditProduct(p);
    setFormData({
      name: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      category_id: p.category_id || '',
      featured: p.featured === 1,
      status: p.status
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('stock', formData.stock);
    payload.append('category_id', formData.category_id);
    payload.append('featured', formData.featured ? 'true' : 'false');
    payload.append('status', formData.status);
    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      if (editProduct) {
        // Edit Mode
        await api.put(`/products/${editProduct.id}`, payload);
        toast.success("Product updated successfully.");
      } else {
        // Create Mode
        await api.post('/products', payload);
        toast.success("Product created successfully.");
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (p) => {
    setDeleteProduct(p);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteProduct.id}`);
      toast.success(`${deleteProduct.name} deleted successfully.`);
      setDeleteModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Failed to delete product.");
    } finally {
      setDeleteLoading(false);
      setDeleteProduct(null);
    }
  };

  return (
    <div className="admin-products-page anim-fade">
      {/* Title Header */}
      <div className="dashboard-header-row">
        <div>
          <h2>Manage Products</h2>
          <p>Create, update, and manage your inventory products catalog</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters Bar */}
      <div className="admin-filters-bar glass-panel">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="form-input filter-search"
          />
        </div>

        <div className="admin-category-filter">
          <SlidersHorizontal size={16} className="filter-icon" />
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : products.length === 0 ? (
        <div className="admin-empty-state glass-panel">
          <h3>No products in store catalog</h3>
          <p>Click "Add Product" above to populate the organic items inventory.</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img 
                        src={p.image_url.startsWith('http') ? p.image_url : `${backendUrl}${p.image_url}`} 
                        alt={p.name} 
                        className="table-item-img"
                      />
                    </td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category_name || 'General'}</td>
                    <td><strong>${p.price.toFixed(2)}</strong></td>
                    <td>
                      <span className={`table-stock-num ${p.stock < 10 ? 'warning-txt' : ''}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.featured === 1 ? 'badge-success' : 'badge-info'}`}>
                        {p.featured === 1 ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-group">
                        <button className="table-action-btn edit" onClick={() => handleOpenEditModal(p)} title="Edit product">
                          <Edit size={16} />
                        </button>
                        <button className="table-action-btn delete" onClick={() => handleOpenDeleteConfirm(p)} title="Delete product">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-wrapper glass-panel">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={18} /> Prev
              </button>
              <span className="pagination-text">Page <strong>{page}</strong> of {totalPages}</span>
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Product Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editProduct ? `Edit: ${editProduct.name}` : 'Add New Product'}
      >
        <form onSubmit={handleFormSubmit} className="admin-product-form">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              placeholder="e.g. Fresh Honeycrisp Apples" 
              className="form-input" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              placeholder="Provide a healthy rich description..." 
              rows="3" 
              className="form-input" 
            />
          </div>

          <div className="form-price-stock-grid">
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input 
                type="number" 
                step="0.01" 
                name="price" 
                value={formData.price} 
                onChange={handleInputChange} 
                placeholder="4.99" 
                className="form-input" 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input 
                type="number" 
                name="stock" 
                value={formData.stock} 
                onChange={handleInputChange} 
                placeholder="40" 
                className="form-input" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Category *</label>
            <select 
              name="category_id" 
              value={formData.category_id} 
              onChange={handleInputChange}
              className="form-input select-input" 
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Product Image (optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              className="form-file-input" 
            />
            {editProduct && !imageFile && (
              <p className="file-input-sub">Current: <code>{editProduct.image_url}</code> (leave blank to keep current)</p>
            )}
          </div>

          <div className="form-checkbox-status-row">
            <div className="form-group-checkbox">
              <input 
                type="checkbox" 
                id="featured" 
                name="featured" 
                checked={formData.featured} 
                onChange={handleInputChange} 
              />
              <label htmlFor="featured">Mark as Featured Product</label>
            </div>
            
            <div className="form-group-select-status">
              <label className="form-label">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange}
                className="form-input select-status-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={deleteProduct ? `Are you sure you want to permanently delete the product "${deleteProduct.name}"? This will clear it from the catalogs and dashboard trackers.` : ''}
        loading={deleteLoading}
      />

      <style>{`
        .admin-products-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .admin-filters-bar {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          gap: 20px;
        }
        .admin-search-wrapper {
          position: relative;
          flex: 0 1 360px;
        }
        .admin-search-wrapper .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .filter-search {
          padding-left: 42px;
          border-radius: var(--radius-full);
          background-color: var(--light-gray);
        }
        .admin-category-filter {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-icon {
          color: var(--text-muted);
        }
        .filter-select {
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          color: var(--dark-light);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }

        .table-item-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: var(--radius-sm);
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
        }

        .table-stock-num.warning-txt {
          color: var(--warning);
          font-weight: 700;
        }

        .table-actions-group {
          display: flex;
          gap: 10px;
        }
        .table-action-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: var(--transition-fast);
        }
        .table-action-btn.edit:hover {
          background-color: var(--primary-glow);
          color: var(--primary);
          border-color: var(--primary);
        }
        .table-action-btn.delete:hover {
          background-color: var(--danger-bg);
          color: var(--danger);
          border-color: var(--danger);
        }

        .admin-empty-state {
          padding: 60px 40px;
          text-align: center;
          color: var(--text-muted);
        }

        /* Product Form styles */
        .admin-product-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-price-stock-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-file-input {
          padding: 8px;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }
        .file-input-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .form-checkbox-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
          margin: 8px 0;
        }
        .form-group-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--dark-light);
        }
        .form-group-select-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .form-group-select-status .form-label {
          margin: 0;
        }
        .select-status-input {
          width: 120px;
          padding: 8px 12px;
        }
        .modal-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .admin-filters-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .admin-search-wrapper {
            width: 100%;
            flex: auto;
          }
        }
      `}</style>
    </div>
  );
};
