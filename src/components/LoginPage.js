import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import bikeekaLogo from '../Images/bikeeka.com logos.png';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Image Container */}
      <div className="auth-background-bg">
        <div className="auth-bg-overlay"></div>
      </div>

      {/* Back to Home Link */}
      <Link to="/" className="auth-back-home-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        <span>Back to Marketplace</span>
      </Link>

      <div className="auth-container">
        {/* Left Panel — Brand Image and Welcome */}
        <div className="auth-brand-panel">
          <div className="auth-brand-panel-overlay"></div>
          <div className="auth-brand-content">
            <h1 className="auth-brand-title">Ride Your <span className="highlight-yellow">Dream Bike</span></h1>
            <p className="auth-brand-subtitle">
              Sri Lanka's largest online marketplace for buying and selling motorcycles and scooters.
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature">
                <span className="auth-feature-icon"><Bike size={18} strokeWidth={2.5} /></span>
                <span>Browse 1000+ Bikes & Scooters</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon"><Zap size={18} strokeWidth={2.5} /></span>
                <span>Post Your Ads Fast & Free</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon"><MessageCircle size={18} strokeWidth={2.5} /></span>
                <span>Chat Directly with Verified Sellers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel — Form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <Link to="/">
                <img src={bikeekaLogo} alt="bikeeka.com" className="auth-card-logo" />
              </Link>
              <h2 className="auth-card-title">Sign In</h2>
              <p className="auth-card-subtitle">Access your account to manage your listings</p>
            </div>

            {error && (
              <div className="auth-error-alert" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form-fields" noValidate>
              {/* Email */}
              <div className="auth-input-group">
                <label htmlFor="login-email" className="auth-input-label">Email Address</label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <div className="auth-label-row">
                  <label htmlFor="login-password" className="auth-input-label">Password</label>
                  <button type="button" className="auth-forgot-link">Forgot?</button>
                </div>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Keep me signed in */}
              <div className="auth-remember-row">
                <label className="auth-checkbox-container">
                  <input type="checkbox" className="auth-real-checkbox" />
                  <span className="auth-custom-checkbox"></span>
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`auth-primary-btn ${isLoading ? 'auth-btn-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="auth-btn-spinner"></span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Switch link */}
            <div className="auth-footer-prompt">
              Don't have an account?{' '}
              <Link to="/register" className="auth-redirect-link">Create one for free</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
