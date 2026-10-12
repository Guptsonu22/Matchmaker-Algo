import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { extractErrorMessage } from '@/utils/formatters';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('matchmaker@datecrew.in');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid credentials. Please verify email and password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Demo@1234');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-accent text-white font-serif font-bold text-2xl shadow-md">
            DC
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900">
            The Date Crew
          </h1>
          <p className="text-xs text-gray-500">
            Internal Matchmaker Operations Management System
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card p-8 shadow-card-hover space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Sign in to your account</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your authorized operational credentials to continue.
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-base text-xs">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-base text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@datecrew.in"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label-base text-xs">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                className="input-base text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 text-sm font-medium"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="border-t border-gray-100 pt-4 text-xs">
            <span className="text-gray-400 block mb-2 font-medium">Quick Demo Accounts:</span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('matchmaker@datecrew.in')}
                className="text-left px-2.5 py-1.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors flex justify-between items-center"
              >
                <span>matchmaker@datecrew.in</span>
                <span className="text-[10px] text-gray-400">Matchmaker</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('lead@datecrew.in')}
                className="text-left px-2.5 py-1.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors flex justify-between items-center"
              >
                <span>lead@datecrew.in</span>
                <span className="text-[10px] text-gray-400">Senior Matchmaker</span>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-400 text-center">
              Password for demo accounts: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600">Demo@1234</code>
            </p>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-[11px] text-gray-400">
          Confidential internal system. All candidate and client data is fictional for internship assessment.
        </p>
      </div>
    </div>
  );
}
