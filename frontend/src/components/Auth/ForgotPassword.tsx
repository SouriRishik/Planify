import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/api';

type Step = 'email' | 'otp' | 'reset';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('OTP sent to your email. Check your inbox.');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setSuccess('OTP verified! Set your new password.');
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, password });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    email: 'Forgot Password',
    otp: 'Enter OTP',
    reset: 'Reset Password',
  };

  const stepSubtitles: Record<Step, string> = {
    email: 'Enter your email to receive a verification code',
    otp: `We sent a 6-digit code to ${email}`,
    reset: 'Choose a new password for your account',
  };

  return (
    <div className="auth-container">
      <button onClick={toggleTheme} className="theme-toggle auth-theme-toggle" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </button>
      <div className="auth-card">
        <h1 className="auth-logo">PLANIFY</h1>
        <p className="auth-subtitle">{stepTitles[step]}</p>
        <p className="auth-step-desc">{stepSubtitles[step]}</p>

        {/* Step indicators */}
        <div className="otp-steps">
          <div className={`otp-step ${step === 'email' ? 'active' : ''} ${step !== 'email' ? 'completed' : ''}`}>1</div>
          <div className={`otp-step-line ${step !== 'email' ? 'completed' : ''}`} />
          <div className={`otp-step ${step === 'otp' ? 'active' : ''} ${step === 'reset' ? 'completed' : ''}`}>2</div>
          <div className={`otp-step-line ${step === 'reset' ? 'completed' : ''}`} />
          <div className={`otp-step ${step === 'reset' ? 'active' : ''}`}>3</div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp">Enter 6-digit OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                placeholder="000000"
                className="otp-input"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-full"
              style={{ marginTop: '0.5rem' }}
              onClick={() => { setError(''); setSuccess(''); handleSendOtp({ preventDefault: () => {} } as React.FormEvent); }}
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-link">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
