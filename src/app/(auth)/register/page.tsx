"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    if (!apiBase) {
      setError('Missing NEXT_PUBLIC_API_URL. Add it to your .env file.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role })
      });

      const data = await response.json();
      
      if (response.ok) {
        setNotice('Registration success! Please log in.');
        setTimeout(() => router.push('/login'), 1200);
      } else {
        setError(data.message || 'Registration failed');
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
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={handleRegister} className="fade-up order-2 rounded-2xl bg-white/90 p-6 shadow-xl md:order-1 md:p-8">
            <div className="stagger">
              <h1 className="font-display text-3xl text-[color:var(--green-darkest)]">Create your BinFetch account</h1>
              <p className="text-sm text-[color:var(--ink-gray)]">
                Join the cleaner city movement in minutes.
              </p>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              {notice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
                  {notice}
                </div>
              )}

              <label className="grid gap-2 text-sm font-medium text-[color:var(--ink-gray)]">
                Full name
                <input
                  type="text"
                  placeholder="Your full name"
                  required
                  autoComplete="name"
                  className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-base text-[color:var(--ink-black)] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>

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
                  placeholder="Create a secure password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-base text-[color:var(--ink-black)] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium text-[color:var(--ink-gray)]">
                I am signing up as
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="rounded-xl border border-emerald-100 bg-white px-4 py-3 text-base text-[color:var(--ink-black)] outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-[color:var(--green-dark)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[color:var(--green-mid)] disabled:cursor-not-allowed disabled:bg-emerald-200"
              >
                {loading ? 'Registering...' : 'Create account'}
              </button>

              <p className="text-center text-sm text-[color:var(--ink-gray)]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[color:var(--green-dark)] hover:text-[color:var(--green-mid)]">
                  Login here
                </Link>
              </p>
            </div>
          </form>

          <div className="fade-up order-1 md:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Together for cleaner cities
            </span>
            <h2 className="font-display mt-6 text-4xl text-[color:var(--green-darkest)] md:text-5xl">
              Every pickup makes a visible impact
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-[color:var(--ink-gray)]">
              Track requests, assign teams, and reward consistency. BinFetch
              helps neighborhoods stay clean with data-driven pickups.
            </p>
            <div className="mt-8 grid gap-4 text-sm text-[color:var(--ink-gray)]">
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="font-semibold text-[color:var(--green-dark)]">Smart routing</p>
                <p className="mt-1">Dispatch staff efficiently with location-aware queues.</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                <p className="font-semibold text-[color:var(--green-dark)]">Transparent status</p>
                <p className="mt-1">Customers know exactly when a pickup is in motion.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}