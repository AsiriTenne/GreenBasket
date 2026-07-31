import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from '../../components/Toast';
import { Spinner, TableSkeleton } from '../../components/Loader';
import { ConfirmModal } from '../../components/Modal';
import { ShieldAlert, Trash2, Search, UserMinus, UserCheck } from 'lucide-react';

export const AdminUsers = () => {
  const { user: currentAdmin } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Confirm Actions Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'status' or 'delete'
    targetUser: null,
    loading: false
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const endpoint = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
      const res = await api.get(endpoint);
      setUsers(res);
    } catch (err) {
      toast.error("Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleOpenStatusModal = (u) => {
    setConfirmModal({
      isOpen: true,
      type: 'status',
      targetUser: u,
      loading: false
    });
  };

  const handleOpenDeleteModal = (u) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      targetUser: u,
      loading: false
    });
  };

  const handleConfirmAction = async () => {
    const { type, targetUser } = confirmModal;
    if (!targetUser) return;

    setConfirmModal(prev => ({ ...prev, loading: true }));
    try {
      if (type === 'status') {
        const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';
        await api.put(`/users/${targetUser.id}/status`, { status: nextStatus });
        toast.success(`User ${targetUser.name} has been ${nextStatus === 'blocked' ? 'blocked' : 'unblocked'}.`);
      } else if (type === 'delete') {
        await api.delete(`/users/${targetUser.id}`);
        toast.success(`User ${targetUser.name} deleted successfully.`);
      }
      setConfirmModal({ isOpen: false, type: '', targetUser: null, loading: false });
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Operation failed.");
      setConfirmModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="admin-users-page anim-fade">
      {/* Title Header */}
      <div className="dashboard-header-row">
        <div>
          <h2>User Accounts</h2>
          <p>Monitor, block/unblock, and delete registered customer accounts</p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="admin-filters-bar glass-panel">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input filter-search"
          />
        </div>
      </div>

      {/* Users table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : users.length === 0 ? (
        <div className="admin-empty-state glass-panel">
          <h3>No registered users found</h3>
          <p>Customers will populate here once they sign up through the cart portal.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const dateStr = new Date(u.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                
                const isAdmin = u.role === 'admin';
                const isSelf = currentAdmin && u.id === currentAdmin.id;

                return (
                  <tr key={u.id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="avatar-circle table-avatar">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <strong>{u.name} {isSelf && <em className="self-tag">(You)</em>}</strong>
                      </div>
                    </td>
                    <td><code>{u.email}</code></td>
                    <td>
                      <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-info'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{dateStr}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {!isAdmin && (
                        <div className="table-actions-group">
                          <button 
                            className={`table-action-btn ${u.status === 'active' ? 'delete' : 'edit'}`}
                            onClick={() => handleOpenStatusModal(u)}
                            title={u.status === 'active' ? 'Block User' : 'Unblock User'}
                          >
                            {u.status === 'active' ? <UserMinus size={16} /> : <UserCheck size={16} />}
                          </button>
                          
                          <button 
                            className="table-action-btn delete"
                            onClick={() => handleOpenDeleteModal(u)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: '', targetUser: null, loading: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'status' ? 'Modify User Status' : 'Permanently Delete User'}
        confirmText={confirmModal.type === 'status' ? (confirmModal.targetUser?.status === 'active' ? 'Block' : 'Unblock') : 'Delete Account'}
        message={
          confirmModal.type === 'status' 
            ? `Are you sure you want to change the status of "${confirmModal.targetUser?.name}" to ${confirmModal.targetUser?.status === 'active' ? 'BLOCKED' : 'ACTIVE'}? Blocked users will not be able to log in.`
            : `Are you sure you want to permanently delete the user account "${confirmModal.targetUser?.name}"? All profile data and key binds will be erased. This action cannot be undone.`
        }
        loading={confirmModal.loading}
      />

      <style>{`
        .admin-users-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        
        .table-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .table-avatar {
          width: 28px;
          height: 28px;
          font-size: 0.75rem;
        }

        .self-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: normal;
        }
      `}</style>
    </div>
  );
};
