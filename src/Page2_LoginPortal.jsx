import React, { useState } from 'react';
import './Page2_LoginPortal.css';

export default function Page2_LoginPortal({ setPage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@') || password.length < 6) {
      setErrorMsg('Invalid email format or password length is too short.');
      setSuccess(false);
    } else {
      setErrorMsg('');
      setSuccess(true);
    }
  };

  return (
    <div className="login-wrapper">
      <button className="back-btn" onClick={() => setPage('home')}>
        ← Exit System
      </button>

      <div className="login-card">
        <h1 className="login-title">Secure Portal Access</h1>
        <p className="login-meta">AUTHENTICATION SUBSYSTEM</p>

        {success ? (
          <div className="alert success-alert">
            <h3>Access Authorized Successfully</h3>
            <p>User session token initialized. Redirecting logged state...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>System Account Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Security Access Token Password</label>
              <div className="input-row">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <small className="field-tip">
                <em>Must contain at least 6 alphanumeric values.</em>
              </small>
            </div>

            {errorMsg && (
              <p className="error-text">
                ⚠️ Error: <span className="striked-error">{errorMsg}</span>
              </p>
            )}

            <button type="submit" className="submit-btn">
              Authorize Session
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
