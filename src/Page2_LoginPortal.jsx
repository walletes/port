import React, { useState } from 'react';
import './Page2_LoginPortal.css';

export default function Page2_LoginPortal({ setPage }) {
  const [authMode, setAuthMode] = useState('login'); 

  // Common State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('12345.0900');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sign In Specific State
  const [rememberDevice, setRememberDevice] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  // Register Specific State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Conditional Registration Fields State
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('1-10 Employees');

  // Dynamic Password Strength Calculator
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'Empty', color: '#CBD5E1', width: '0%' };
    if (pass.length < 6) return { label: 'Weak', color: '#EF4444', width: '33%' };
    
    const hasLetters = /[a-zA-Z]/.test(pass);
    const hasNumbers = /[0-9]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

    if (hasLetters && hasNumbers && hasSpecial && pass.length >= 8) {
      return { label: 'Strong', color: '#16A34A', width: '100%' };
    }
    if ((hasLetters && hasNumbers) || (hasNumbers && hasSpecial) || (hasLetters && hasSpecial)) {
      return { label: 'Medium', color: '#F59E0B', width: '66%' };
    }
    return { label: 'Weak', color: '#EF4444', width: '33%' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleDemoFill = () => {
    setEmail('prince@example.com');
    setPassword('12345.0900');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLockedOut) return;

    if (authMode === 'register') {
      if (!fullName.trim() || !username.trim()) {
        setErrorMsg('Please complete your Full Name and Username.');
        return;
      }
      if (accountType === 'Enterprise' && !companyName.trim()) {
        setErrorMsg('Please enter your Company Name.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (!acceptedTerms) {
        setErrorMsg('You must agree to the Terms of Service.');
        return;
      }
    }

    if (!email.includes('@') || password.length < 6) {
      if (authMode === 'login') {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          setIsLockedOut(true);
          setErrorMsg('Too many unsuccessful attempts. Please wait 15 seconds.');
          setTimeout(() => {
            setIsLockedOut(false);
            setFailedAttempts(0);
            setErrorMsg('');
          }, 15000);
        } else {
          setErrorMsg(`Incorrect email or password. Attempt ${newAttempts} of 3.`);
        }
      } else {
        setErrorMsg('Password must be at least 6 characters long.');
      }
      setSuccess(false);
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setFailedAttempts(0);
    }, 700);
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setErrorMsg('');
    setSuccess(false);
  };

  return (
    <div className="login-wrapper">
      <header className="login-header-bar">
        <button className="back-btn" onClick={() => setPage('home')}>
          ← Back to Directory
        </button>
      </header>

      <div className="login-grid-container">
        {/* Primary Authentication Card */}
        <div className="login-card reddish-brown-card">
          <div className="auth-tab-row">
            <button
              className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </div>

          <h1 className="login-title">
            {authMode === 'login' ? 'Global Entry Portal' : 'Create New Account'}
          </h1>
          <p className="login-meta">
            {authMode === 'login' 
              ? 'Sign in to manage your account and profile' 
              : 'Register your account to get started'}
          </p>

          {success ? (
            <div className="alert success-alert">
              <h3>{authMode === 'login' ? 'Welcome Back!' : 'Account Created Successfully!'}</h3>
              <p>
                {authMode === 'login' 
                  ? `Successfully signed in as ${email}.`
                  : `Your ${accountType} account for ${fullName} (${username}) is now active.`}
              </p>
              
              <div className="workspace-session-summary">
                <div className="session-detail-row">
                  <span>Session Status:</span>
                  <span className="badge-highlight">Active & Verified</span>
                </div>
                <div className="session-detail-row">
                  <span>Account Tier:</span>
                  <span className="badge-highlight">{accountType} Profile</span>
                </div>
              </div>

              <button 
                className="submit-btn reset-btn" 
                onClick={() => { 
                  setSuccess(false); 
                  setEmail(''); 
                  setPassword('12345.0900'); 
                  setConfirmPassword(''); 
                  setFullName(''); 
                  setUsername('');
                  setPhoneNumber('');
                  setBio('');
                  setGithubUrl('');
                  setTechStack('');
                  setCompanyName('');
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="login-form">
              {authMode === 'register' && (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Prince Osinachi"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Username / Handle</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@prince_dev"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Account Category</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      disabled={isLoading}
                      className="form-select"
                    >
                      <option value="Personal">Personal Account</option>
                      <option value="Developer">Developer / Engineering</option>
                      <option value="Enterprise">Enterprise Team</option>
                    </select>
                  </div>

                  {/* Dynamic Conditional Fields based on Account Category Choice */}
                  {accountType === 'Personal' && (
                    <div className="form-group dynamic-field-box">
                      <label>Profile Bio / Note</label>
                      <input
                        type="text"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Frontend engineer building web apps"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  {accountType === 'Developer' && (
                    <div className="dynamic-field-group">
                      <div className="form-group">
                        <label>GitHub or Portfolio URL</label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Primary Tech Stack</label>
                        <input
                          type="text"
                          value={techStack}
                          onChange={(e) => setTechStack(e.target.value)}
                          placeholder="React, TypeScript, Node.js"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {accountType === 'Enterprise' && (
                    <div className="dynamic-field-group">
                      <div className="form-group">
                        <label>Company / Organization Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Systems Ltd"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="form-group">
                        <label>Expected Team Size</label>
                        <select
                          value={teamSize}
                          onChange={(e) => setTeamSize(e.target.value)}
                          disabled={isLoading}
                          className="form-select"
                        >
                          <option value="1-10 Employees">1-10 Employees</option>
                          <option value="11-50 Employees">11-50 Employees</option>
                          <option value="50+ Employees">50+ Employees</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+234 800 000 0000"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <div className="label-with-action">
                  <label>Email Address</label>
                  {authMode === 'login' && (
                    <button type="button" className="demo-fill-btn" onClick={handleDemoFill}>
                      Auto-fill Demo
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading || isLockedOut}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-row">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading || isLockedOut}
                  />
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLockedOut}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {password && (
                  <div className="password-meter-wrapper">
                    <div 
                      className="password-meter-bar" 
                      style={{ width: passwordStrength.width, backgroundColor: passwordStrength.color }}
                    ></div>
                    <small className="meter-label" style={{ color: passwordStrength.color }}>
                      Strength: {passwordStrength.label}
                    </small>
                  </div>
                )}
              </div>

              {authMode === 'register' && (
                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                {confirmPassword && (
                  <small
                  className="field-tip"
                  style={{
                  color: confirmPassword === password ? '#16A34A' : '#EF4444',
                  fontWeight: '700',
                  marginTop: '4px',
                  display: 'block'
                  }}
                  >
                  {confirmPassword === password ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </small>
                  )}
                  </div>
              )}

              <div className="form-options-row">
                {authMode === 'login' ? (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      disabled={isLoading || isLockedOut}
                    />
                    Remember this device for 30 days
                  </label>
                ) : (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      disabled={isLoading}
                    />
                    I agree to the Terms of Service & Privacy Policy
                  </label>
                )}
              </div>

              {errorMsg && (
                <p className="error-text">
                  ⚠️ <span className="striked-error">{errorMsg}</span>
                </p>
              )}

              <button type="submit" className="submit-btn" disabled={isLoading || isLockedOut}>
                {isLoading ? (
                  <span className="loading-state">
                    <span className="spinner"></span> Processing...
                  </span>
                ) : isLockedOut ? (
                  'Temporarily Locked'
                ) : authMode === 'login' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Secondary Technical Metadata Card */}
        <div className="telemetry-sidebar-card green-card">
          <h3>User Experience & Security Highlights</h3>
          <ul className="spec-list">
            <li><strong>Conditional Forms:</strong> Registration fields dynamically adapt to user-selected profile types.</li>
            <li><strong>Seamless Navigation:</strong> Instant switching between Sign In and Registration workflows.</li>
            <li><strong>Password Protection:</strong> Real-time meter assessing password strength dynamically.</li>
            <li><strong>Security Protection:</strong> Safeguards protect against automated sign-in abuse.</li>
          </ul>
          <div className="compliance-stamp">
            <span>✓ Fully Encrypted Data Transmission</span>
            <span>✓ Privacy-First Account Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
