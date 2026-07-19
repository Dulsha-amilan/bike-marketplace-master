import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import './AdminLoginPage.css';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await login({ email, password });
      
      // Enforce that only admins can pass through this login page
      if (data.user && data.user.role === 'admin') {
        navigate('/admin');
      } else {
        // Log them out immediately if they are not an admin
        logout();
        setError('Access Denied: Only administrator accounts are permitted.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card glass-panel">
        <div className="admin-login-header">
          <div className="admin-icon-container">
            <Shield size={36} className="admin-shield-icon" />
          </div>
          <h2>Admin Command Center</h2>
          <p>Authorized personnel access only</p>
        </div>

        {error && (
          <div className="admin-login-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="admin-input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@bikeeka.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Security Password</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="admin-login-spinner"></span>
            ) : (
              <span>Decrypt & Log In</span>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-to-store-link">
            <ArrowLeft size={14} />
            <span>Return to Marketplace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;