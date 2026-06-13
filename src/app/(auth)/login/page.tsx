"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const saveSession = (payload: { access_token: string; userId: string; role: string; fullName?: string }) => {
    localStorage.setItem('bf_token', payload.access_token);
    localStorage.setItem('bf_user_id', payload.userId);
    localStorage.setItem('bf_role', payload.role);
    if (payload.fullName) {
      localStorage.setItem('bf_full_name', payload.fullName);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL. Add it to your .env file.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        saveSession(data);
        if (data.role === 'staff') {
          router.push('/staff-dashboard');
        } else {
          router.push('/customer-dashboard');
        }
      } else {
        setError(data.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to the server. Is NestJS running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-grid w-full max-w-5xl rounded-3xl p-6 md:p-10">
        <div className="grid gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <div className="fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Clean living
            </span>
            <h1 className="font-display mt-6 text-4xl font-semibold text-[color:var(--green-darkest)] md:text-5xl">
              Welcome back to BinFetch
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[color:var(--ink-gray)]">
              Manage pickup requests, track rewards, and keep your community clean.
              Log in to continue the green streak.
            </p>
            <div className="mt-8 grid gap-4 text-sm text-[color:var(--ink-gray)]">
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="font-semibold text-[color:var(--green-dark)]">Instant confirmations</p>
                <p className="mt-1">Get real-time updates the moment a staff member responds.</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="font-semibold text-[color:var(--green-dark)]">Rewards that grow</p>
                <p className="mt-1">Earn points for each pickup and redeem sustainable perks.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="fade-up rounded-2xl bg-white/90 p-6 shadow-xl md:p-8">
            <div className="stagger">
              <h2 className="font-display text-2xl text-[color:var(--green-darkest)]">Sign in</h2>
              <p className="text-sm text-[color:var(--ink-gray)]">
                Use your registered email and password.
              </p>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <label className="grid gap-2 text-sm font-medium text-[color:var(--ink-gray)]">
                Email address
                <input
                  type="email"
                  placeholder="you@email.com"
                  required
                  autoComplete="email"
                  className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-base text-[color:var(--ink-black)] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[color:var(--ink-gray)]">
                Password
                <input
                  type="password"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-base text-[color:var(--ink-black)] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[color:var(--green-dark)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[color:var(--green-mid)] disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="text-center text-sm text-[color:var(--ink-gray)]">
                New to BinFetch?{' '}
                <Link href="/register" className="font-semibold text-[color:var(--green-dark)] hover:text-[color:var(--green-mid)]">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}