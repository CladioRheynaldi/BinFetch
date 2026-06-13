'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActionCard from "@/components/shared/ActionCard";

interface PickupRequest {
  id: string;
  waste_type: string;
  volume_kg: number;
  status: string;
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-700' },
  processing: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700' },
};

const wasteEmojis: Record<string, string> = {
  plastic: '♻️ Plastic',
  electronic: '📱 Electronic',
  organic: '🍌 Organic',
  paper: '📄 Paper',
  mixed: '🗑️ Mixed',
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [points, setPoints] = useState<number>(0);
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/pickup/profile`, { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setPoints(profileData.reward_points || 0);
      }

      
      const historyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/pickup/my-requests`, { headers });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setRequests(historyData);
      }
    } catch (err: any) {
      setError('Failed to refresh dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  
  const activeRequestsCount = requests.filter(
    r => ['pending', 'accepted', 'processing'].includes(r.status.toLowerCase())
  ).length;

  const completedRequestsCount = requests.filter(
    r => r.status.toLowerCase() === 'completed'
  ).length;

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">
      {}
      <section className="auth-card auth-grid rounded-[32px] p-10">
        <p className="uppercase tracking-[0.3em] text-sm text-green-700 font-bold">
          Clean Living & Recycling
        </p>

        <h1 className="font-display text-5xl md:text-6xl font-bold text-green-950 mt-4 leading-tight">
          Welcome Back to BinFetch
        </h1>

        <p className="text-lg text-gray-600 mt-4 max-w-3xl font-medium">
          Manage pickup requests, track rewards, and contribute to a cleaner
          environment while earning points for every recycling activity.
        </p>
      </section>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {}
      {loading ? (
        <section className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="auth-card rounded-3xl p-6 animate-pulse space-y-2 bg-white">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-3">
          <div className="auth-card rounded-3xl p-6 border border-green-50/50 bg-white shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              ⭐ Reward Points Balance
            </p>
            <h2 className="text-5xl font-bold text-green-700 mt-4">
              {points.toLocaleString()} <span className="text-xl text-green-600 font-medium">pts</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 border border-green-50/50 bg-white shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              📅 Active Requests
            </p>
            <h2 className="text-5xl font-bold text-amber-600 mt-4">
              {activeRequestsCount} <span className="text-xl text-amber-600 font-medium font-display">active</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 border border-green-50/50 bg-white shadow-sm flex flex-col justify-between">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              ✅ Completed Pickups
            </p>
            <h2 className="text-5xl font-bold text-emerald-600 mt-4">
              {completedRequestsCount} <span className="text-xl text-emerald-600 font-medium font-display">completed</span>
            </h2>
          </div>
        </section>
      )}

      {}
      <section>
        <h2 className="font-display text-3xl font-bold text-green-950 mb-6">
          Dashboard Menu Actions
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            href="/request-pickup"
            title="♻️ Create Request"
            description="Schedule a new waste pickup using the interactive geocoding map."
          />

          <ActionCard
            href="/my-request"
            title="📋 Look History Request"
            description="Track, inspect, and manage your full pickup history and statuses."
          />

          <ActionCard
            href="/reward"
            title="🎁 Exchange Point Page"
            description="Redeem your reward points for exciting, eco-friendly green items."
          />
        </div>
      </section>

      {}
      <section className="auth-card rounded-3xl p-8 bg-white border border-green-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-3xl font-bold text-green-950">
            Recent Activity History
          </h2>
          <Link href="/my-request" className="text-green-700 font-semibold text-sm hover:underline">
            View All Requests →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-gray-100 rounded w-full"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="text-gray-500 font-medium text-center py-6">
            No pickup requests found. Click "Create Request" above to get started!
          </p>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 5).map((req) => {
              const badge = statusColors[req.status.toLowerCase()] || {
                bg: 'bg-gray-100',
                text: 'text-gray-700',
              };
              return (
                <Link
                  key={req.id}
                  href="/my-request"
                  className="flex items-center justify-between border-b border-green-50 pb-4 hover:bg-green-50/20 p-2 rounded-2xl transition duration-300 group"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-green-950 group-hover:text-green-700 transition">
                      {wasteEmojis[req.waste_type.toLowerCase()] || req.waste_type}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">
                      Estimated: {req.volume_kg} kg • {new Date(req.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                    {req.status}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
