import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../components/Toast';
import { Spinner } from '../components/Loader';
import { Mail, Lock, ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminLogin = ({ setTab, setTabRaw }) => {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      
      if (loggedUser.role !== 'admin') {
        throw new Error("Access denied. You do not have administrator privileges.");
      }

      toast.success("Welcome back, Administrator!");
      setTabRaw('admin-dashboard');
    } catch (err) {
      toast.error(err.message || "Failed to sign in as Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      setTabRaw('admin-dashboard');
    }
  }, [user]);

  return (
    <div className="container admin-login-page anim-fade">
      <div className="admin-login-card glass-panel">
        <div className="admin-hdr">
          <ShieldAlert size={36} className="admin-gate-icon" />
          <h2>Admin Control Gate</h2>
          <p>Access is restricted to authorized store managers only.</p>
        </div>

        <form onSubmit={handleAdminSubmit} className="admin-login-form">
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div className="input-with-icon-wrapper">
              <Mail className="input-field-icon" size={18} />
              <input 
                type="email" 
                
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input input-with-icon" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon-wrapper">
              <Lock className="input-field-icon" size={18} />
              <input 
                type="password" 
                
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input input-with-icon" 
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-admin-submit" disabled={loading}>
            {loading ? <Spinner size="small" color="#fff" /> : 'Authenticate & Unlock'}
          </button>
        </form>

        <div className="admin-help-box">
          <p><strong>Demo Credentials:</strong></p>
          <p>Email: <code>admin@greenbasket.com</code></p>
          <p>Password: <code>admin123</code></p>
        </div>

        <button 
          type="button" 
          className="btn btn-secondary btn-back-shop"
          onClick={() => setTab('home')}
        >
          <ArrowLeft size={16} />
          <span>Return to Store</span>
        </button>
      </div>

      <style>{`
        .admin-login-page {
          padding-top: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .admin-login-card {
          width: 100%;
          max-width: 400px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .admin-hdr {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .admin-gate-icon {
          color: var(--primary);
        }
        .admin-hdr h2 {
          font-size: 1.5rem;
        }
        .admin-hdr p {
          color: var(--text-muted);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .btn-admin-submit {
          width: 100%;
          padding: 12px;
        }
        .admin-help-box {
          font-size: 0.75rem;
          color: var(--text-muted);
          background-color: var(--light-gray);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: var(--radius-sm);
        }
        .admin-help-box code {
          background-color: var(--white);
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid var(--border-color);
          font-weight: bold;
        }
        .btn-back-shop {
          width: 100%;
          padding: 10px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
