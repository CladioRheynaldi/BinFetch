'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      setProfile({
        id: decoded.sub || '',
        email: decoded.email || '',
        full_name: decoded.full_name || 'BinFetch Member',
        role: decoded.role || 'customer',
        created_at: new Date().toISOString(), 
      });

    } catch (err) {
      setError('Could not decode user token');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user_id');
    localStorage.removeItem('bf_role');
    router.push('/login');
  };

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
        <div className="auth-card rounded-3xl p-8 max-w-2xl mx-auto border border-green-100 mt-8 shadow-md">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 text-green-700 text-4xl font-bold shadow-inner">
              👤
            </div>
            <h1 className="font-display text-3xl font-bold text-green-950">
              {profile?.full_name || 'My Profile'}
            </h1>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-800">
              {profile?.role || 'Customer'} Member
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-green-950/60 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-sand-50 rounded-xl border border-gray-100 text-gray-800">
                  {profile?.email || 'N/A'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-green-950/60 uppercase tracking-wider">
                  Account Identifier
                </label>
                <div className="px-4 py-3 bg-sand-50 rounded-xl border border-gray-100 text-gray-500 font-mono text-xs">
                  {profile?.id || 'N/A'}
                </div>
              </div>

              <div className="pt-6 border-t border-green-500/10 flex flex-col sm:flex-row gap-4 justify-between">
                <button
                  onClick={() => {
                    if (profile?.role === 'staff') {
                      router.push('/staff-dashboard');
                    } else {
                      router.push('/customer-dashboard');
                    }
                  }}
                  className="px-6 py-3 border border-green-700 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition text-center"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition text-center shadow-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
