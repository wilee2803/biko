import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login, register, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      if (resetMode) {
        await resetPassword(email);
        setSuccessMessage(t('auth.resetEmailSent'));
      } else if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Auth error:', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const enterResetMode = () => {
    setResetMode(true);
    setError('');
    setSuccessMessage('');
  };

  const exitResetMode = () => {
    setResetMode(false);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/biko-logo.png" alt="biko" className="h-16 mx-auto mb-2" />
          <p className="text-slate-500">{t('app.title')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
            />
          </div>

          {!resetMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-biko-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {!isRegister && (
                <button
                  type="button"
                  onClick={enterResetMode}
                  className="mt-1 text-sm text-biko-600 hover:text-biko-700"
                >
                  {t('auth.forgotPassword')}
                </button>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-biko-600 text-white rounded-lg font-medium hover:bg-biko-700 disabled:opacity-50 transition-colors"
          >
            {resetMode
              ? t('auth.resetPassword')
              : isRegister
                ? t('auth.register')
                : t('auth.login')}
          </button>

          {resetMode ? (
            <button
              type="button"
              onClick={exitResetMode}
              className="w-full text-sm text-biko-600 hover:text-biko-700"
            >
              {t('auth.backToLogin')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="w-full text-sm text-biko-600 hover:text-biko-700"
            >
              {isRegister ? t('auth.hasAccount') : t('auth.noAccount')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
