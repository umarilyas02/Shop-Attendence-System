import React, { useState, useEffect } from 'react';

// Reusable auth-gate component. Renders either first-run "create owner
// account" form, or the regular login form, depending on whether an
// owner account already exists in the local DB.
export default function LoginScreen({ onLoginSuccess }) {
  const [isFirstRun, setIsFirstRun] = useState(null); // null = loading
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.api.auth.hasOwnerAccount().then((exists) => setIsFirstRun(!exists));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (isFirstRun) {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setSubmitting(false);
          return;
        }
        const result = await window.api.auth.createOwnerAccount(username.trim(), password);
        if (!result.success) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
        onLoginSuccess(username.trim());
      } else {
        const result = await window.api.auth.login(username.trim(), password);
        if (!result.success) {
          setError(result.error);
          setSubmitting(false);
          return;
        }
        onLoginSuccess(username.trim());
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  if (isFirstRun === null) {
    return <div className="login-screen loading">Loading...</div>;
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Shop Attendance</h1>
        <p className="login-subtitle">
          {isFirstRun ? 'Create your owner account to get started' : 'Sign in to continue'}
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {isFirstRun && (
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Please wait...' : isFirstRun ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
