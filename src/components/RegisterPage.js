import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bike, Zap, MessageCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import bikeekaLogo from '../Images/bikeeka.com logos.png';
import './LoginPage.css'; // shared styles
import './RegisterPage.css'; // register-specific overrides

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, label: labels[score] };
  }, [password]);

  const validate = () => {
    const errors = {};

    if (!name.trim()) errors.name = 'Full name is required';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!email.trim()) errors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    if (!acceptTerms) errors.terms = 'You must accept the terms and conditions';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-background-bg">
          <div className="auth-bg-overlay"></div>
        </div>
        <div className="auth-success-box">
          <div className="auth-success-circle">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#FFD600" strokeWidth="3" opacity="0.3"/>
              <path d="M20 32l8 8 16-16" stroke="#FFD600" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="auth-check-path"/>
            </svg>
          </div>
          <h2 className="auth-success-title">Welcome to Bikeeka!</h2>
          <p className="auth-success-text">Your account was created successfully. Redirecting you to homepage...</p>
        </div>
      </div>
    );
  }

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
          <div className="auth-brand-panel-overlay text-green-glow"></div>
          <div className="auth-brand-content">
            <h1 className="auth-brand-title">Join <span className="highlight-yellow">Bikeeka</span></h1>
            <p className="auth-brand-subtitle">
              Register now to start buying, selling, and managing your motorcycle advertisements instantly.
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature">
                <span className="auth-feature-icon"><Zap size={18} strokeWidth={2.5} /></span>
                <span>Fully Secure Free Registration</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon"><Bike size={18} strokeWidth={2.5} /></span>
                <span>Publish Bike Advertisements Instantly</span>
              </div>
              <div className="auth-feature">
                <span className="auth-feature-icon"><MessageCircle size={18} strokeWidth={2.5} /></span>
                <span>Get Leads & Manage Buyer Chats</span>
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
              <h2 className="auth-card-title">Create Account</h2>
              <p className="auth-card-subtitle">Sign up in seconds to start listing your bikes</p>
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
              {/* Full Name */}
              <div className="auth-input-group">
                <label htmlFor="reg-name" className="auth-input-label">Full Name</label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. John Perera"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                    autoComplete="name"
                    required
                  />
                </div>
                {fieldErrors.name && <span className="auth-input-error-msg">{fieldErrors.name}</span>}
              </div>

              {/* Email Address */}
              <div className="auth-input-group">
                <label htmlFor="reg-email" className="auth-input-label">Email Address</label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                    autoComplete="email"
                    required
                  />
                </div>
                {fieldErrors.email && <span className="auth-input-error-msg">{fieldErrors.email}</span>}
              </div>

              {/* Phone Number */}
              <div className="auth-input-group">
                <label htmlFor="reg-phone" className="auth-input-label">Phone Number <span className="label-optional">(optional)</span></label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="e.g. 077 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label htmlFor="reg-password" className="auth-input-label">Password</label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
                    autoComplete="new-password"
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
                {fieldErrors.password && <span className="auth-input-error-msg">{fieldErrors.password}</span>}

                {/* Password Strength Indicator */}
                {password && (
                  <div className={`auth-strength-box strength-level-${passwordStrength.score}`}>
                    <div className="auth-strength-meter">
                      <div className="auth-strength-progress"></div>
                    </div>
                    <span className="auth-strength-text">Password Strength: {passwordStrength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label htmlFor="reg-confirm" className="auth-input-label">Confirm Password</label>
                <div className="auth-input-container">
                  <svg className="auth-field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="reg-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? (
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
                {fieldErrors.confirmPassword && <span className="auth-input-error-msg">{fieldErrors.confirmPassword}</span>}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="auth-terms-row">
                <label className="auth-checkbox-container">
                  <input
                    type="checkbox"
                    className="auth-real-checkbox"
                    checked={acceptTerms}
                    onChange={(e) => { setAcceptTerms(e.target.checked); setFieldErrors(p => ({ ...p, terms: '' })); }}
                  />
                  <span className="auth-custom-checkbox"></span>
                  <span className="terms-description-text">
                    I accept the <button type="button" className="auth-terms-link">Terms of Service</button> and <button type="button" className="auth-terms-link">Privacy Policy</button>
                  </span>
                </label>
                {fieldErrors.terms && <span className="auth-input-error-msg">{fieldErrors.terms}</span>}
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
                  <span>Register</span>
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="auth-footer-prompt">
              Already have an account?{' '}
              <Link to="/login" className="auth-redirect-link">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
