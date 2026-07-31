import React, { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { toast } from '../components/Toast';
import { Spinner } from '../components/Loader';
import { User, Mail, Lock, LogIn, UserPlus, Fingerprint, ShieldCheck } from 'lucide-react';

export const CustomerLogin = ({ setTab, setTabRaw }) => {
  const { login, register, socialLogin, passkeyLogin } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forms states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Passkey Modal Dialog simulation state
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      toast.error("Please fill in all the required fields.");
      return;
    }

    setLoading(true);
    try {
      let loggedUser;
      if (isSignUp) {
        loggedUser = await register(name, email, password);
        toast.success("Welcome! Account created successfully.");
      } else {
        loggedUser = await login(email, password);
        toast.success("Logged in successfully!");
      }
      if (loggedUser.role === 'admin') {
        setTabRaw('admin-dashboard');
      } else {
        setTab('home');
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('[Google Login] handleGoogleSuccess called with:', credentialResponse);
    if (!credentialResponse.credential) {
      console.error('[Google Login] No credential in response');
      toast.error("Google did not return a valid credential.");
      return;
    }
    try {
      console.log('[Google Login] Calling socialLogin with credential');
      await socialLogin('google', credentialResponse.credential);
      console.log('[Google Login] socialLogin succeeded, navigating home');
      toast.success("Authenticated via Google!");
      setTab('home');
    } catch (err) {
      console.error('[Google Login] socialLogin failed:', err.message);
      toast.error(err.message || "Google authentication failed.");
    }
  };

  const handleGoogleError = () => {
    console.error('[Google Login] handleGoogleError called');
    toast.error("Google sign-in was interrupted. Please try again.");
  };

  // Mock Facebook Login
  const handleFacebookLogin = async () => {
    setLoading(true);
    toast.info("Connecting to Facebook OAuth...");
    setTimeout(async () => {
      try {
        await socialLogin('facebook', 'facebook.user@gmail.com', 'Facebook User');
        toast.success("Authenticated via Facebook!");
        setTab('home');
      } catch (err) {
        toast.error("Facebook authentication failed.");
        setLoading(false);
      }
    }, 1200);
  };

  // Mock Passkey WebAuthn Login Dialog Trigger
  const triggerPasskeyLoginPrompt = () => {
    setShowPasskeyPrompt(true);
  };

  const handlePasskeyAuthSelect = async () => {
    setPasskeyLoading(true);
    toast.info("Scanning biometric credentials...");

    setTimeout(async () => {
      try {
        // Authenticate with the seeded customer key
        // Note: the seeded customer ID we can match is 'mock-key-seeded-customer' or we can just send any key
        // For simplicity, let's assume we can trigger passkeyLogin using a mock handle
        // Wait, what if we use the credentialId that we saved on register?
        // Since it's a mock, we can send a hardcoded ID which our backend auth routes can fetch, 
        // OR we can fetch the user by email first, but WebAuthn doesn't need email!
        // So on register we saved passkey_credential_id. Let's just log in the user that has the passkey.
        // Wait, on db seed we didn't add a passkey, but the user can register one.
        // If they click this mock login, we can log in as 'Jane Customer' by sending a placeholder credentialId!
        // Let's check what the backend does: 
        // SELECT * FROM users WHERE passkey_credential_id = ?
        // If they haven't registered one yet, we can register one in the profile.
        // For the mock, we can fall back to log in as the default customer if there are no keys, 
        // but if there is a registered key, we send the key.
        // Let's check the database users:
        // We will make the passkey login route accept 'mock-key-seeded-customer' or similar, 
        // but wait! Since they might not have registered a key, let's write a mock key in database.js seeds? 
        // Ah, we can just allow the client to register a key in profile, and then use that key here!
        // To make it super robust, we will check if any key exists, or let the user choose a mock key.
        // In database.js we didn't seed a passkey_credential_id for Jane Customer.
        // What if we update Jane Customer to have a default mock key 'jane-passkey-123' so they can login immediately using passkey?
        // That is a brilliant idea! Let's update database.js to seed Jane Customer with passkey_credential_id = 'jane-passkey-123'.
        // Let's do that! Let's write the code for passkey login here, which uses 'jane-passkey-123' by default!
        const credentialId = 'jane-passkey-123'; 
        await passkeyLogin(credentialId);
        toast.success("Biometrics verified. Logged in successfully!");
        setShowPasskeyPrompt(false);
        setTab('home');
      } catch (err) {
        toast.error(err.message || "No registered Passkey found. Please sign in and register a device key in settings.");
        setPasskeyLoading(false);
        setShowPasskeyPrompt(false);
      }
    }, 1500);
  };

  return (
    <div className="container login-page anim-fade">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h2>{isSignUp ? 'Create an Account' : 'Welcome Back'}</h2>
          <p>{isSignUp ? 'Sign up to shop organic and track orders' : 'Log in to checkout and manage settings'}</p>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon-wrapper">
                <User className="input-field-icon" size={18} />
                <input 
                  type="text" 
                  
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="form-input input-with-icon" 
                  required 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
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

          <button type="submit" className="btn btn-primary btn-login-submit" disabled={loading}>
            {loading ? <Spinner size="small" color="#fff" /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="divider-row">
          <span>or login with secure keys</span>
        </div>

        {/* Passwordless Passkey CTA */}
        <button 
          type="button" 
          className="btn btn-secondary btn-passkey-login"
          onClick={triggerPasskeyLoginPrompt}
          disabled={loading}
        >
          <Fingerprint size={18} />
          <span>Use Device Passkey (WebAuthn)</span>
        </button>

        <div className="divider-row">
          <span>or sign in with</span>
        </div>

        {/* Social Logins Grid */}
        <div className="social-logins-grid">
          {googleClientId ? (
            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          ) : (
            <button type="button" className="btn btn-secondary social-btn" disabled title="Set VITE_GOOGLE_CLIENT_ID env to enable">
              <span className="social-icon">🌐</span> Google
            </button>
          )}
          <button type="button" className="btn btn-secondary social-btn" onClick={handleFacebookLogin} disabled={loading}>
            <span className="social-icon">👤</span> Facebook
          </button>
        </div>

        {/* Form Switcher */}
        <div className="form-switcher">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            className="form-switch-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      {/* Mock Passkey Browser Prompt Modal */}
      {showPasskeyPrompt && (
        <div className="passkey-prompt-overlay" onClick={() => setShowPasskeyPrompt(false)}>
          <div className="passkey-prompt-dialog anim-slide-up" onClick={e => e.stopPropagation()}>
            <div className="prompt-header">
              <Fingerprint size={28} className="prompt-fingerprint" />
              <h3>Sign in with Passkey</h3>
              <p>Choose a credential to authenticate with <strong>GreenBasket</strong></p>
            </div>
            
            {passkeyLoading ? (
              <div className="prompt-spinner-wrapper">
                <Spinner size="medium" />
                <p>Connecting to secure hardware key...</p>
              </div>
            ) : (
              <div className="prompt-credentials-list">
                <button className="credential-row-btn" onClick={handlePasskeyAuthSelect}>
                  <div className="cred-icon-circle">👤</div>
                  <div className="cred-details">
                    <div className="cred-name">Jane Customer</div>
                    <div className="cred-meta">customer@greenbasket.com (Device Key)</div>
                  </div>
                  <span className="shield-check-icon">✓</span>
                </button>
                
                <button className="btn btn-secondary btn-cancel-prompt" onClick={() => setShowPasskeyPrompt(false)}>
                  Cancel Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .login-page {
          padding-top: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-header {
          text-align: center;
        }
        .login-header h2 {
          font-size: 1.75rem;
          margin-bottom: 6px;
        }
        .login-header p {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .btn-login-submit {
          width: 100%;
          padding: 12px;
          font-size: 0.95rem;
        }
        .divider-row {
          text-align: center;
          position: relative;
          margin: 4px 0;
        }
        .divider-row::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background-color: var(--border-color);
          z-index: 1;
        }
        .divider-row span {
          background-color: var(--white);
          padding: 0 10px;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          position: relative;
          z-index: 2;
        }

        .btn-passkey-login {
          width: 100%;
          border-color: var(--primary);
          color: var(--primary);
          font-weight: 700;
        }
        .btn-passkey-login:hover {
          background-color: var(--primary-glow);
        }

        .social-logins-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .social-btn {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .social-icon {
          font-size: 1rem;
        }
        .google-btn-wrapper {
          display: flex;
          justify-content: center;
        }
        .google-btn-wrapper > div {
          width: 100% !important;
        }


        .form-switcher {
          text-align: center;
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-top: 10px;
        }
        .form-switch-btn {
          font-weight: 700;
          color: var(--primary);
          margin-left: 6px;
          transition: var(--transition-fast);
        }
        .form-switch-btn:hover {
          color: var(--primary-hover);
          text-decoration: underline;
        }

        /* Passkey prompt styling */
        .passkey-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease forwards;
        }
        .passkey-prompt-dialog {
          background-color: var(--white);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
          width: 90%;
          max-width: 380px;
          padding: 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .prompt-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .prompt-fingerprint {
          color: var(--primary);
          margin-bottom: 6px;
        }
        .prompt-header h3 {
          font-size: 1.2rem;
        }
        .prompt-header p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .prompt-spinner-wrapper {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .prompt-spinner-wrapper p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .prompt-credentials-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .credential-row-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          text-align: left;
          background-color: var(--light-gray);
          transition: var(--transition-fast);
          width: 100%;
        }
        .credential-row-btn:hover {
          background-color: var(--white);
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .cred-icon-circle {
          font-size: 1.25rem;
        }
        .cred-name {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--dark);
        }
        .cred-meta {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .shield-check-icon {
          margin-left: auto;
          color: var(--success);
          font-weight: 700;
        }
        .btn-cancel-prompt {
          width: 100%;
          padding: 10px;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};
