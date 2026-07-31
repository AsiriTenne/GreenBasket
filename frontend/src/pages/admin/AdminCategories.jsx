import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { Spinner, TableSkeleton } from '../../components/Loader';
import { Modal, ConfirmModal } from '../../components/Modal';
import { Edit, Trash2, Plus, Tag } from 'lucide-react';

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null); // null means "Create" mode
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [catName, setCatName] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res);
    } catch (err) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = () => {
    setEditCategory(null);
    setCatName('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (c) => {
    setEditCategory(c);
    setCatName(c.name);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!catName.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editCategory) {
        // Edit Mode
        await api.put(`/categories/${editCategory.id}`, { name: catName });
        toast.success("Category updated successfully.");
      } else {
        // Create Mode
        await api.post('/categories', { name: catName });
        toast.success("Category created successfully.");
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Failed to save category.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleOpenDeleteConfirm = (c) => {
    setDeleteCategory(c);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCategory) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/categories/${deleteCategory.id}`);
      toast.success(`Category "${deleteCategory.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || "Failed to delete category.");
    } finally {
      setDeleteLoading(false);
      setDeleteCategory(null);
    }
  };

  return (
    <div className="admin-categories-page anim-fade">
      {/* Title Header */}
      <div className="dashboard-header-row">
        <div>
          <h2>Manage Categories</h2>
          <p>Organize products catalog by departments (e.g. Vegetables, Fruits)</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Main Categories Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : categories.length === 0 ? (
        <div className="admin-empty-state glass-panel">
          <h3>No categories recorded</h3>
          <p>Add a new category above to begin classification.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Slug Link</th>
                <th>Product Count</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td><code>#{c.id}</code></td>
                  <td><strong>{c.name}</strong></td>
                  <td><code>/{c.slug}</code></td>
                  <td>
                    <span className="badge badge-info">{c.product_count} products</span>
                  </td>
                  <td>
                    <div className="table-actions-group">
                      <button className="table-action-btn edit" onClick={() => handleOpenEditModal(c)} title="Rename Category">
                        <Edit size={16} />
                      </button>
                      <button className="table-action-btn delete" onClick={() => handleOpenDeleteConfirm(c)} title="Delete Category">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCategory ? `Rename: ${editCategory.name}` : 'Create Category'}
      >
        <form onSubmit={handleFormSubmit} className="admin-cat-form">
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <div className="input-with-icon-wrapper">
              <Tag className="input-field-icon" size={18} />
              <input 
                type="text" 
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Fresh Drinks"
                className="form-input input-with-icon"
                required
              />
            </div>
            <p className="file-input-sub">A web-safe slug will be automatically compiled (e.g. "Fresh Drinks" → "fresh-drinks").</p>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
              {submitLoading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        message={deleteCategory ? `Are you sure you want to delete the category "${deleteCategory.name}"? Active products inside this category will be unassigned (marked as General) but NOT deleted.` : ''}
        loading={deleteLoading}
      />

      <style>{`
        .admin-categories-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .admin-cat-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
      `}</style>
    </div>
  );
};
