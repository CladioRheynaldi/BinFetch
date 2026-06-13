'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActionCard from "@/components/shared/ActionCard";

interface Pickup {
  id: string;
  waste_type: string;
  volume_kg: number;
  pickup_address: string;
  status: string;
  special_instructions?: string;
  created_at: string;
  assigned_staff_id?: string;
  user_id?: string;
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  processing: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

const wasteEmojis: Record<string, string> = {
  plastic: '♻️ Plastic',
  electronic: '📱 Electronic',
  organic: '🍌 Organic',
  paper: '📄 Paper',
  mixed: '🗑️ Mixed',
};

export default function StaffDashboardPage() {
  const router = useRouter();
  const [pickups, setPickups] = useState<Pickup[]>([]);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/assigned`, { headers });
      if (response.ok) {
        const data = await response.json();
        setPickups(data);
      } else {
        setError('Failed to fetch assigned pickups.');
      }
    } catch (err: any) {
      setError('Cannot connect to the server. Is NestJS running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  
  const assignedCount = pickups.filter(
    p => p.status.toLowerCase() === 'pending'
  ).length;

  const ongoingCount = pickups.filter(
    p => ['accepted', 'processing'].includes(p.status.toLowerCase())
  ).length;

  const completedCount = pickups.filter(
    p => p.status.toLowerCase() === 'completed'
  ).length;

  
  const activeAssignments = pickups.filter(
    p => ['pending', 'accepted', 'processing'].includes(p.status.toLowerCase())
  );

  
  const historyAssignments = pickups.filter(
    p => ['completed', 'cancelled'].includes(p.status.toLowerCase())
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {}
      <section className="auth-card auth-grid rounded-[32px] p-10 bg-slate-900 text-white border border-emerald-950/30 shadow-lg animate-fade-in">
        <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 border border-emerald-500/30">
          Staff Portal • Operations Center
        </span>

        <h1 className="font-display mt-6 text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          BinFetch Operations ♻_
        </h1>

        <p className="mt-4 max-w-3xl text-lg text-slate-300 leading-relaxed font-medium">
          Monitor pickup requests, accept or decline assignments, start collections, 
          and verify completions. Keep your community clean with real-time operations.
        </p>
      </section>

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-2xl text-sm font-semibold animate-shake">
          {error}
        </div>
      )}

      {}
      {loading ? (
        <section className="grid gap-6 md:grid-cols-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-3">
          <div className="auth-card rounded-3xl p-6 border border-emerald-50/50 bg-white shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              📥 Assigned (Pending)
            </p>
            <h2 className="text-5xl font-bold text-amber-600 mt-4">
              {assignedCount} <span className="text-xl text-amber-500 font-medium">pickups</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 border border-emerald-50/50 bg-white shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              🚀 Ongoing Collections
            </p>
            <h2 className="text-5xl font-bold text-indigo-600 mt-4">
              {ongoingCount} <span className="text-xl text-indigo-500 font-medium font-display">active</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 border border-emerald-50/50 bg-white shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300">
            <p className="text-gray-500 font-semibold text-sm uppercase tracking-wider">
              ✅ Completed Log
            </p>
            <h2 className="text-5xl font-bold text-emerald-600 mt-4">
              {completedCount} <span className="text-xl text-emerald-600 font-medium font-display">done</span>
            </h2>
          </div>
        </section>
      )}

      {}
      <section className="space-y-6">
        <h2 className="font-display text-3xl font-bold text-green-950">
          Pickup Assignments Menu
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          <ActionCard
            href="/pickups?status=pending"
            title="📥 Assigned Requests"
            description="Accept or decline new pickups assigned to your team pool."
          />

          <ActionCard
            href="/pickups?status=accepted"
            title="🚀 Active Collections"
            description="Manage accepted collections and start processing them."
          />

          <ActionCard
            href="/pickups?status=completed"
            title="📋 Completed History"
            description="Inspect all past recycling logs and rewarded completions."
          />
        </div>
      </section>

      {}
      <section className="grid gap-8 lg:grid-cols-2">
        
        {}
        <div className="auth-card rounded-3xl p-8 bg-white border border-green-50 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-green-50 pb-4">
              <h2 className="font-display text-3xl font-bold text-green-950">
                Active Assignments
              </h2>
              <Link href="/pickups" className="text-emerald-700 font-semibold text-sm hover:underline">
                Manage All →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-14 bg-gray-100 rounded-2xl w-full"></div>
              </div>
            ) : activeAssignments.length === 0 ? (
              <p className="text-gray-500 font-medium text-center py-10">
                No active or pending assignments. Check tab menus above!
              </p>
            ) : (
              <div className="space-y-4">
                {activeAssignments.slice(0, 5).map((pickup) => {
                  const badge = statusColors[pickup.status.toLowerCase()] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                  };
                  return (
                    <Link
                      key={pickup.id}
                      href={`/pickups?id=${pickup.id}&status=${pickup.status}`}
                      className="flex items-center justify-between border-b border-green-50 pb-4 hover:bg-green-50/20 p-3 rounded-2xl transition duration-300 group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-green-950 group-hover:text-green-700 transition">
                          {wasteEmojis[pickup.waste_type.toLowerCase()] || pickup.waste_type}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] md:max-w-[300px]">
                          {pickup.pickup_address}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          Volume: {pickup.volume_kg} kg • {new Date(pickup.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                        {pickup.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="auth-card rounded-3xl p-8 bg-white border border-green-50 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-green-50 pb-4">
              <h2 className="font-display text-3xl font-bold text-green-950">
                Pickup History Log
              </h2>
              <Link href="/pickups?status=completed" className="text-emerald-700 font-semibold text-sm hover:underline">
                View History →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-14 bg-gray-100 rounded-2xl w-full"></div>
                <div className="h-14 bg-gray-100 rounded-2xl w-full"></div>
              </div>
            ) : historyAssignments.length === 0 ? (
              <p className="text-gray-500 font-medium text-center py-10">
                No completed pickup history logs found.
              </p>
            ) : (
              <div className="space-y-4">
                {historyAssignments.slice(0, 5).map((pickup) => {
                  const badge = statusColors[pickup.status.toLowerCase()] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                  };
                  return (
                    <Link
                      key={pickup.id}
                      href={`/pickups?status=completed`}
                      className="flex items-center justify-between border-b border-green-50 pb-4 hover:bg-green-50/20 p-3 rounded-2xl transition duration-300 group"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-green-950 group-hover:text-emerald-700 transition">
                          {wasteEmojis[pickup.waste_type.toLowerCase()] || pickup.waste_type}
                        </p>
                        <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] md:max-w-[300px]">
                          {pickup.pickup_address}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          Volume: {pickup.volume_kg} kg • {new Date(pickup.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.text}`}>
                        {pickup.status}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </section>
    </main>
  );
}