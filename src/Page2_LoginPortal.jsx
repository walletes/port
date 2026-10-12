import React, { useEffect, useMemo, useState } from 'react';
import './Page2_LoginPortal.css';

const DEMO_ACCOUNT = {
  email: 'prince@example.com',
  password: '12345.0900',
};

const LOCKOUT_SECONDS = 15;
const MAX_ATTEMPTS = 3;

const ACCOUNT_TYPES = [
  { value: 'Personal', label: 'Personal account' },
  { value: 'Developer', label: 'Developer / Engineering' },
  { value: 'Enterprise', label: 'Enterprise team' },
];

const TEAM_SIZES = [
  '1–10 employees',
  '11–50 employees',
  '50+ employees',
];

function evaluatePassword(password) {
  if (!password) {
    return {
      label: 'Not entered',
      score: 0,
      checks: [],
    };
  }

  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'An uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'A number', passed: /\d/.test(password) },
    {
      label: 'A special character',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const score = checks.filter((check) => check.passed).length;

  const commonPatterns =
    /^(password|password123|12345678|qwerty|letmein)/i.test(password);

  let label = 'Weak';

  if (password.length < 8 || commonPatterns) {
    label = 'Weak';
  } else if (score >= 5 && !commonPatterns) {
    label = 'Strong';
  } else if (score >= 3) {
    label = 'Fair';
  }

  return { label, score, checks, commonPatterns };
}

function FormField({
  id,
  label,
  error,
  hint,
  className = '',
  children,
}) {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id}>{label}</label>
      {children}

      {hint && !error && <small className="auth-field-hint">{hint}</small>}

      {error && (
        <small className="auth-field-error" id={`${id}-error`}>
          {error}
        </small>
      )}
    </div>
  );
}

function PasswordField({
  id,
  label = 'Password',
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  disabled = false,
  autoComplete = 'current-password',
  error,
  hint,
}) {
  return (
    <FormField id={id} label={label} error={error} hint={hint}>
      <div className="input-row auth-password-row">
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        <button
          type="button"
          className="toggle-btn"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
    </FormField>
  );
}

function PasswordStrength({ password }) {
  const result = useMemo(() => evaluatePassword(password), [password]);

  if (!password) return null;

  const width = `${(result.score / 5) * 100}%`;

  return (
    <div className="password-meter-wrapper">
      <div
        className="password-meter-track"
        role="progressbar"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={5}
        aria-valuenow={result.score}
        aria-valuetext={result.label}
      >
        <div
          className={`password-meter-bar strength-${result.label.toLowerCase()}`}
          style={{ width }}
        />
      </div>

      <div className="password-meter-heading">
        <span>Password strength</span>
        <strong className={`strength-label strength-text-${result.label.toLowerCase()}`}>
          {result.label}
        </strong>
      </div>

      <ul className="password-checklist">
        {result.checks.map((check) => (
          <li
            key={check.label}
            className={check.passed ? 'check-passed' : ''}
          >
            <span aria-hidden="true">{check.passed ? '✓' : '○'}</span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function AuthNotice({ type = 'info', children }) {
  if (!children) return null;

  return (
    <div
      className={`auth-notice auth-notice-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="auth-notice-marker" aria-hidden="true">
        {type === 'error' ? '!' : type === 'success' ? '✓' : 'i'}
      </span>
      <div>{children}</div>
    </div>
  );
}

function AuthSidebar({ mode }) {
  const details = {
    login: {
      index: '01',
      eyebrow: 'YOUR WORKSPACE',
      title: 'Good to have you back.',
      description:
        'A portfolio authentication interface built around clear feedback, predictable states, and practical form behavior.',
    },
    register: {
      index: '02',
      eyebrow: 'NEW ACCOUNT',
      title: 'Start with the right details.',
      description:
        'Profile fields adapt to the account type, keeping the registration experience relevant to each user.',
    },
    recovery: {
      index: '03',
      eyebrow: 'ACCOUNT RECOVERY',
      title: 'Getting back in should be simple.',
      description:
        'A straightforward recovery flow with clear instructions and no unnecessary steps.',
    },
  };

  const current = details[mode];

  return (
    <aside className="telemetry-sidebar-card green-card auth-sidebar">
      <div className="auth-sidebar-topline">
        <span className="auth-status-dot" />
        PORTFOLIO DEMONSTRATION
        <span className="auth-sidebar-index">{current.index}</span>
      </div>

      <p className="auth-sidebar-eyebrow">{current.eyebrow}</p>
      <h2>{current.title}</h2>
      <p className="auth-sidebar-description">{current.description}</p>

      <div className="auth-feature-list">
        <div className="auth-feature-item">
          <span className="auth-feature-number">01</span>
          <div>
            <strong>Form validation</strong>
            <p>Input checks and clear field-level feedback.</p>
          </div>
        </div>

        <div className="auth-feature-item">
          <span className="auth-feature-number">02</span>
          <div>
            <strong>Adaptive registration</strong>
            <p>Account-specific fields with reusable components.</p>
          </div>
        </div>

        <div className="auth-feature-item">
          <span className="auth-feature-number">03</span>
          <div>
            <strong>Accessible interactions</strong>
            <p>Keyboard-friendly controls and announced status messages.</p>
          </div>
        </div>

        <div className="auth-feature-item">
          <span className="auth-feature-number">04</span>
          <div>
            <strong>Explicit demo behavior</strong>
            <p>No real account creation.</p>
          </div>
        </div>
      </div>

      <div className="auth-sidebar-footer">
        <span>REACT</span>
        <span>STATE MANAGEMENT</span>
        <span>FORM UX</span>
      </div>
    </aside>
  );
}
export default function Page2_LoginPortal({ setPage }) {
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [accountType, setAccountType] = useState('Personal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState(TEAM_SIZES[0]);

  const [rememberDevice, setRememberDevice] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [notice, setNotice] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  const passwordResult = useMemo(
    () => evaluatePassword(password),
    [password]
  );

  const isLockedOut = lockoutSeconds > 0;

  useEffect(() => {
    if (lockoutSeconds <= 0) return undefined;

    const timer = window.setTimeout(() => {
      setLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [lockoutSeconds]);

  useEffect(() => {
    return () => {
      if (window.authDemoTimer) {
        window.clearTimeout(window.authDemoTimer);
      }
    };
  }, []);

  const clearFeedback = () => {
    setNotice(null);
    setFieldErrors({});
  };

  const resetFormFeedback = () => {
    clearFeedback();
    setRecoverySubmitted(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (mode) => {
    if (isLoading) return;

    setAuthMode(mode);
    resetFormFeedback();
  };

  const handleDemoFill = () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setShowPassword(false);
    clearFeedback();
  };

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const startLockout = () => {
    setFailedAttempts(MAX_ATTEMPTS);
    setLockoutSeconds(LOCKOUT_SECONDS);

    setNotice({
      type: 'error',
      title: 'Too many attempts',
      message: `Demo sign-in is temporarily paused. Try again in ${LOCKOUT_SECONDS} seconds.`,
    });
  };

  const handleLogin = () => {
    const errors = {};

    if (!validateEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Enter your password.';
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setNotice({
        type: 'error',
        title: 'Check your details',
        message: 'Correct the highlighted fields and try again.',
      });
      return;
    }

    const credentialsMatch =
      email.trim().toLowerCase() === DEMO_ACCOUNT.email &&
      password === DEMO_ACCOUNT.password;

    if (!credentialsMatch) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= MAX_ATTEMPTS) {
        startLockout();
        return;
      }

      setNotice({
        type: 'error',
        title: 'Sign-in unsuccessful',
        message: `The demo credentials do not match. Attempt ${nextAttempts} of ${MAX_ATTEMPTS}.`,
      });

      return;
    }

    setIsLoading(true);
    clearFeedback();

    window.authDemoTimer = window.setTimeout(() => {
      setSession({
        email: DEMO_ACCOUNT.email,
        name: 'Demo User',
        accountType: 'Personal',
        signedInAt: new Date().toLocaleString(),
        rememberDevice,
      });

      setFailedAttempts(0);
      setIsLoading(false);
      setNotice(null);
    }, 650);
  };

  const validateRegistration = () => {
    const errors = {};

    if (fullName.trim().length < 2) {
      errors.fullName = 'Enter your full name.';
    }

    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username.trim())) {
      errors.username =
        'Use 3–24 letters, numbers, underscores, dots, or hyphens.';
    }

    if (!validateEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (password.length < 8 || passwordResult.label === 'Weak') {
      errors.password =
        'Choose a password of at least 8 characters that is not easily guessed.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Your passwords do not match.';
    }

    if (accountType === 'Enterprise' && !companyName.trim()) {
      errors.companyName = 'Enter your organization name.';
    }

    if (accountType === 'Developer' && githubUrl.trim()) {
      try {
        const parsedUrl = new URL(githubUrl);

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          errors.githubUrl = 'Use a valid HTTP or HTTPS URL.';
        }
      } catch {
        errors.githubUrl = 'Enter a valid portfolio or GitHub URL.';
      }
    }

    if (!acceptedTerms) {
      errors.acceptedTerms = 'You must accept the demo terms to continue.';
    }

    return errors;
  };

  const handleRegister = () => {
    const errors = validateRegistration();

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setNotice({
        type: 'error',
        title: 'Registration needs attention',
        message: 'Review the highlighted fields before continuing.',
      });
      return;
    }

    setIsLoading(true);
    clearFeedback();

    window.authDemoTimer = window.setTimeout(() => {
      setSession({
        email: email.trim(),
        name: fullName.trim(),
        username: username.trim(),
        accountType,
        signedInAt: new Date().toLocaleString(),
        rememberDevice: false,
        demoRegistration: true,
        companyName: accountType === 'Enterprise' ? companyName.trim() : '',
        teamSize: accountType === 'Enterprise' ? teamSize : '',
      });

      setIsLoading(false);
    }, 650);
  };

  const handleRecovery = (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setFieldErrors({ email: 'Enter a valid email address.' });
      setNotice({
        type: 'error',
        title: 'Email required',
        message: 'Enter a valid email address to continue.',
      });
      return;
    }

    setIsLoading(true);
    clearFeedback();

    window.authDemoTimer = window.setTimeout(() => {
      setIsLoading(false);
      setRecoverySubmitted(true);
      setNotice({
        type: 'success',
        title: 'Demo recovery complete',
        message:
          'This is a local demonstration. No email was sent and no account password was changed.',
      });
    }, 650);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLoading || isLockedOut || session) return;

    clearFeedback();

    if (authMode === 'login') {
      handleLogin();
    } else if (authMode === 'register') {
      handleRegister();
    }
  };

  const handleSignOut = () => {
    if (window.authDemoTimer) {
      window.clearTimeout(window.authDemoTimer);
      window.authDemoTimer = null;
    }

    setSession(null);
    setPassword('');
    setConfirmPassword('');
    setEmail('');
    setRememberDevice(false);
    setFailedAttempts(0);
    setLockoutSeconds(0);
    setIsLoading(false);
    setAuthMode('login');
    resetFormFeedback();
  };

  const handleBack = () => {
    if (typeof setPage === 'function') {
      setPage('home');
    }
  };

  const modeCopy = {
    login: {
      title: 'Welcome back.',
      subtitle: 'Sign in to explore the demo workspace.',
      button: 'Sign in',
    },
    register: {
      title: 'Create your account.',
      subtitle: 'Set up a profile for this demonstration.',
      button: 'Create demo account',
    },
    recovery: {
      title: 'Reset your password.',
      subtitle: 'Enter your email to explore the recovery flow.',
      button: 'Continue',
    },
  };

  const currentCopy = modeCopy[authMode];
return (
    <main className="login-wrapper auth-page">
      <header className="login-header-bar auth-header">
        <button type="button" className="back-btn" onClick={handleBack}>
          <span aria-hidden="true">←</span> Back to Directory
        </button>

        <div className="auth-header-label">
          <span className="auth-header-dot" />
          AUTHENTICATION PAGE
        </div>

      </header>

      <div className="login-grid-container auth-layout">
        <section
          className="login-card reddish-brown-card auth-card"
          aria-labelledby="auth-title"
        >
          {session ? (
            <div className="auth-success-screen">
              <div className="auth-success-icon" aria-hidden="true">
                ✓
              </div>

              <p className="auth-eyebrow">DEMO SESSION</p>

              <h1 className="login-title" id="auth-title">
                {session.demoRegistration
                  ? 'Profile created.'
                  : 'You’re signed in.'}
              </h1>

              <p className="login-meta">
                {session.demoRegistration
                  ? 'Your local demonstration profile is ready.'
                  : 'Your local demo session is now active.'}
              </p>

              <AuthNotice type="success">
                <strong>Demonstration only.</strong>
                <p>
                  No real account was authenticated or created on a server.
                </p>
              </AuthNotice>

              <div className="workspace-session-summary auth-session-summary">
                <div className="session-detail-row">
                  <span>Session status</span>
                  <strong className="badge-highlight">Demo active</strong>
                </div>

                <div className="session-detail-row">
                  <span>Name</span>
                  <strong>{session.name}</strong>
                </div>

                <div className="session-detail-row">
                  <span>Email</span>
                  <strong>{session.email}</strong>
                </div>

                <div className="session-detail-row">
                  <span>Account type</span>
                  <strong>{session.accountType}</strong>
                </div>

                {session.username && (
                  <div className="session-detail-row">
                    <span>Username</span>
                    <strong>{session.username}</strong>
                  </div>
                )}

                {session.companyName && (
                  <div className="session-detail-row">
                    <span>Organization</span>
                    <strong>{session.companyName}</strong>
                  </div>
                )}

                <div className="session-detail-row">
                  <span>Started</span>
                  <strong>{session.signedInAt}</strong>
                </div>
              </div>

              <button
                type="button"
                className="submit-btn reset-btn"
                onClick={handleSignOut}
              >
                Sign out of demo
              </button>

              <button
                type="button"
                className="auth-text-button auth-home-button"
                onClick={handleBack}
              >
                Return to project directory
              </button>
            </div>
          ) : (
            <>
              <div className="auth-card-topline">
                <span>ACCOUNT ACCESS</span>
                <span className="auth-demo-badge">DEMO MODE</span>
              </div>

              {authMode !== 'recovery' && (
                <div className="auth-tab-row" role="tablist" aria-label="Account access mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'login'}
                    className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                    onClick={() => switchMode('login')}
                    disabled={isLoading}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={authMode === 'register'}
                    className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                    onClick={() => switchMode('register')}
                    disabled={isLoading}
                  >
                    Create account
                  </button>
                </div>
              )}

              <div className="auth-heading">
                <p className="auth-eyebrow">
                  {authMode === 'login'
                    ? 'YOUR WORKSPACE'
                    : authMode === 'register'
                      ? 'NEW PROFILE'
                      : 'ACCOUNT RECOVERY'}
                </p>

                <h1 className="login-title" id="auth-title">
                  {currentCopy.title}
                </h1>

                <p className="login-meta">{currentCopy.subtitle}</p>
              </div>

              {authMode === 'login' && (
                <div className="auth-demo-credentials">
                  <div>
                    <span className="auth-demo-label">TEST THE INTERFACE</span>
                    <p>Use the sample credentials to explore the success state.</p>
                  </div>

                  <button
                    type="button"
                    className="demo-fill-btn"
                    onClick={handleDemoFill}
                    disabled={isLoading || isLockedOut}
                  >
                    Fill demo details
                  </button>
                </div>
              )}

              {notice && (
                <AuthNotice type={notice.type}>
                  {notice.title && <strong>{notice.title}</strong>}
                  {notice.message && <p>{notice.message}</p>}
                </AuthNotice>
              )}

              {authMode === 'recovery' ? (
                <form className="login-form" onSubmit={handleRecovery} noValidate>
                  <FormField
                    id="recovery-email"
                    label="Email address"
                    error={fieldErrors.email}
                    hint="This demo does not send recovery emails."
                  >
                    <input
                      id="recovery-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setFieldErrors({});
                        setNotice(null);
                        setRecoverySubmitted(false);
                      }}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                  </FormField>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isLoading || recoverySubmitted}
                  >
                    {isLoading
                      ? 'Processing…'
                      : recoverySubmitted
                        ? 'Demo complete'
                        : currentCopy.button}
                  </button>

                  <button
                    type="button"
                    className="auth-text-button auth-back-to-login"
                    onClick={() => switchMode('login')}
                    disabled={isLoading}
                  >
                    ← Return to sign in
                  </button>
                </form>
              ) : (
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                  {authMode === 'register' && (
                    <>
                      <div className="auth-form-section-heading">
                        <span>01</span>
                        <div>
                          <h2>Personal details</h2>
                          <p>Tell us a little about your profile.</p>
                        </div>
                      </div>

                      <FormField
                        id="full-name"
                        label="Full name"
                        error={fieldErrors.fullName}
                      >
                        <input
                          id="full-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          placeholder="Your full name"
                          required
                          disabled={isLoading}
                          aria-invalid={Boolean(fieldErrors.fullName)}
                        />
                      </FormField>

                      <FormField
                        id="username"
                        label="Username"
                        error={fieldErrors.username}
                        hint="3–24 characters. Letters, numbers, dots, underscores, and hyphens."
                      >
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder="your_username"
                          minLength={3}
                          maxLength={24}
                          required
                          disabled={isLoading}
                          aria-invalid={Boolean(fieldErrors.username)}
                        />
                      </FormField>

                      <FormField id="account-type" label="Account category">
                        <select
                          id="account-type"
                          name="accountType"
                          value={accountType}
                          onChange={(event) => {
                            setAccountType(event.target.value);
                            setFieldErrors({});
                            setNotice(null);
                          }}
                          disabled={isLoading}
                          className="form-select"
                        >
                          {ACCOUNT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </FormField>

                      {accountType === 'Personal' && (
                        <FormField
                          id="bio"
                          label="Profile note"
                          hint="Optional. A short introduction."
                        >
                          <textarea
                            id="bio"
                            name="bio"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            placeholder="A little about what you do..."
                            rows={3}
                            maxLength={180}
                            disabled={isLoading}
                          />
                          <span className="auth-character-count">
                            {bio.length}/180
                          </span>
                        </FormField>
                      )}

                      {accountType === 'Developer' && (
                        <div className="auth-conditional-fields">
                          <FormField
                            id="github-url"
                            label="GitHub or portfolio URL"
                            error={fieldErrors.githubUrl}
                            hint="Optional. Include https://"
                          >
                            <input
                              id="github-url"
                              name="url"
                              type="url"
                              autoComplete="url"
                              value={githubUrl}
                              onChange={(event) =>
                                setGithubUrl(event.target.value)
                              }
                              placeholder="https://github.com/username"
                              disabled={isLoading}
                              aria-invalid={Boolean(fieldErrors.githubUrl)}
                            />
                          </FormField>

                          <FormField
                            id="tech-stack"
                            label="Primary tech stack"
                          >
                            <input
                              id="tech-stack"
                              name="techStack"
                              type="text"
                              value={techStack}
                              onChange={(event) =>
                                setTechStack(event.target.value)
                              }
                              placeholder="React, Node.js, PostgreSQL"
                              disabled={isLoading}
                            />
                          </FormField>
                        </div>
                      )}

                      {accountType === 'Enterprise' && (
                        <div className="auth-conditional-fields">
                          <FormField
                            id="company-name"
                            label="Organization name"
                            error={fieldErrors.companyName}
                          >
                            <input
                              id="company-name"
                              name="organization"
                              type="text"
                              autoComplete="organization"
                              value={companyName}
                              onChange={(event) =>
                                setCompanyName(event.target.value)
                              }
                              placeholder="Company or organization"
                              required
                              disabled={isLoading}
                              aria-invalid={Boolean(fieldErrors.companyName)}
                            />
                          </FormField>

                          <FormField id="team-size" label="Expected team size">
                            <select
                              id="team-size"
                              name="teamSize"
                              value={teamSize}
                              onChange={(event) =>
                                setTeamSize(event.target.value)
                              }
                              disabled={isLoading}
                              className="form-select"
                            >
                              {TEAM_SIZES.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </FormField>
                        </div>
                      )}

                      <FormField
                        id="phone-number"
                        label="Phone number"
                        hint="Optional."
                      >
                        <input
                          id="phone-number"
                          name="tel"
                          type="tel"
                          autoComplete="tel"
                          value={phoneNumber}
                          onChange={(event) =>
                            setPhoneNumber(event.target.value)
                          }
                          placeholder="+234 800 000 0000"
                          disabled={isLoading}
                        />
                      </FormField>

                      <div className="auth-form-section-heading">
                        <span>02</span>
                        <div>
                          <h2>Account credentials</h2>
                          <p>Set the details for your demo profile.</p>
                        </div>
                      </div>
                    </>
                  )}

                  <FormField
                    id="email"
                    label="Email address"
                    error={fieldErrors.email}
                  >
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setFieldErrors((previous) => ({
                          ...previous,
                          email: undefined,
                        }));
                      }}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading || isLockedOut}
                      aria-invalid={Boolean(fieldErrors.email)}
                    />
                  </FormField>

                  <PasswordField
                    id="password"
                    label="Password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((previous) => ({
                        ...previous,
                        password: undefined,
                        confirmPassword: undefined,
                      }));
                    }}
                    showPassword={showPassword}
                    onToggleVisibility={() =>
                      setShowPassword((visible) => !visible)
                    }
                    disabled={isLoading || isLockedOut}
                    autoComplete={
                      authMode === 'register'
                        ? 'new-password'
                        : 'current-password'
                    }
                    error={fieldErrors.password}
                  />
      {authMode === 'register' && (
                    <>
                      <PasswordStrength password={password} />

                      <PasswordField
                        id="confirm-password"
                        label="Confirm password"
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value);
                          setFieldErrors((previous) => ({
                            ...previous,
                            confirmPassword: undefined,
                          }));
                        }}
                        showPassword={showConfirmPassword}
                        onToggleVisibility={() =>
                          setShowConfirmPassword((visible) => !visible)
                        }
                        disabled={isLoading}
                        autoComplete="new-password"
                        error={fieldErrors.confirmPassword}
                      />

                      {confirmPassword && (
                        <p
                          className={`auth-password-match ${
                            password === confirmPassword ? 'is-matching' : ''
                          }`}
                          aria-live="polite"
                        >
                          {password === confirmPassword
                            ? '✓ Passwords match'
                            : 'Passwords do not match yet'}
                        </p>
                      )}
                    </>
                  )}

                  {authMode === 'login' && (
                    <div className="auth-options-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={rememberDevice}
                          onChange={(event) =>
                            setRememberDevice(event.target.checked)
                          }
                          disabled={isLoading || isLockedOut}
                        />
                        <span>Remember this preference</span>
                      </label>

                      <button
                        type="button"
                        className="auth-text-button"
                        onClick={() => switchMode('recovery')}
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div className="auth-terms-block">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(event) => {
                            setAcceptedTerms(event.target.checked);
                            setFieldErrors((previous) => ({
                              ...previous,
                              acceptedTerms: undefined,
                            }));
                          }}
                          disabled={isLoading}
                        />
                        <span>
                          I understand this is a demonstration and agree to
                          continue.
                        </span>
                      </label>

                      {fieldErrors.acceptedTerms && (
                        <small className="auth-field-error">
                          {fieldErrors.acceptedTerms}
                        </small>
                      )}
                    </div>
                  )}

                  {isLockedOut && (
                    <AuthNotice type="error">
                      <strong>Temporary demo lockout</strong>
                      <p>
                        You can try again in {lockoutSeconds}{' '}
                        {lockoutSeconds === 1 ? 'second' : 'seconds'}.
                      </p>
                    </AuthNotice>
                  )}

                  <button
                    type="submit"
                    className="submit-btn auth-submit-btn"
                    disabled={isLoading || isLockedOut}
                  >
                    {isLoading ? (
                      <span className="loading-state">
                        <span className="spinner" />
                        Processing…
                      </span>
                    ) : isLockedOut ? (
                      `Try again in ${lockoutSeconds}s`
                    ) : (
                      <>
                        {currentCopy.button}
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <p className="auth-form-disclaimer">
                    {authMode === 'login'
                      ? 'Demo credentials are required. No real account is accessed.'
                      : 'Your profile exists only in this page session. Nothing is saved to a server.'}
                  </p>
                </form>
              )}

              {authMode === 'login' && (
                <p className="auth-mode-switch">
                  New here?{' '}
                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() => switchMode('register')}
                    disabled={isLoading}
                  >
                    Create a demo account
                  </button>
                </p>
              )}

              {authMode === 'register' && (
                <p className="auth-mode-switch">
                  Already exploring?{' '}
                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() => switchMode('login')}
                    disabled={isLoading}
                  >
                    Return to sign in
                  </button>
                </p>
              )}
            </>
          )}
        </section>

        <AuthSidebar mode={authMode} />
      </div>

      <footer className="auth-page-footer">
        <span>PROJECT PORTFOLIO </span>
        <span>REACT · FORM VALIDATION · STATE MANAGEMENT</span>
      </footer>
    </main>
  );
}
