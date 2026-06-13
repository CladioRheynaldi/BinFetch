'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RewardItem {
  id: string;
  name: string;
  image_url?: string;
}

interface Redemption {
  id: string;
  points_spent: number;
  status: string;
  notes?: string;
  created_at: string;
  reward_items?: RewardItem;
}

export default function ExchangeHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/rewards/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load exchange history.');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Compute summary stats
  const totalSpent = history.reduce((sum, item) => sum + item.points_spent, 0);
  const totalClaimed = history.length;
  const pendingClaims = history.filter(h => h.status.toLowerCase() === 'pending').length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-green-50 pb-6 gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">
            My Portfolio
          </span>
          <h1 className="font-display text-4xl font-bold text-green-950 font-semibold">
            Point Exchange History
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Review your past rewards redemptions and track pending claims.
          </p>
        </div>
        <Link
          href="/reward"
          className="inline-flex justify-center items-center px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition shadow-sm self-start"
        >
          🛍️ Visit Rewards Store
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && history.length > 0 && (
        <section className="grid gap-6 md:grid-cols-3">
          <div className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm flex flex-col justify-between">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
              ⭐ Total Points Redeemed
            </span>
            <h2 className="text-4xl font-extrabold text-green-700 mt-4">
              {totalSpent.toLocaleString()} <span className="text-base font-semibold">pts</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm flex flex-col justify-between">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
              📦 Items Claimed
            </span>
            <h2 className="text-4xl font-extrabold text-green-950 mt-4">
              {totalClaimed} <span className="text-base font-semibold text-gray-500">rewards</span>
            </h2>
          </div>

          <div className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm flex flex-col justify-between">
            <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">
              ⏳ Pending Claims
            </span>
            <h2 className="text-4xl font-extrabold text-amber-600 mt-4">
              {pendingClaims} <span className="text-base font-semibold text-amber-500">pending</span>
            </h2>
          </div>
        </section>
      )}

      {/* History List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="auth-card rounded-3xl p-6 h-20 bg-gray-100"></div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="auth-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 bg-white border border-green-50 shadow-sm">
          <div className="text-6xl">🎟️</div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-green-950">No exchange history</h3>
            <p className="text-gray-600">
              You haven't exchanged any recycling points for sustainable rewards yet.
            </p>
          </div>
          <Link
            href="/reward"
            className="inline-block px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition shadow-sm"
          >
            Redeem Your First Reward
          </Link>
        </div>
      ) : (
        <div className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-4">Reward Item</th>
                  <th className="pb-4">Redemption ID</th>
                  <th className="pb-4">Points Spent</th>
                  <th className="pb-4">Date Claimed</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50 text-sm font-medium text-gray-700">
                {history.map((claim) => {
                  const itemInfo = claim.reward_items;
                  const isPending = claim.status.toLowerCase() === 'pending';

                  return (
                    <tr key={claim.id} className="hover:bg-green-50/10 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg bg-cover bg-center border border-gray-100 flex-shrink-0"
                          style={{
                            backgroundImage: `url('${itemInfo?.image_url || 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04'}')`,
                          }}
                        ></div>
                        <span className="font-bold text-green-950">{itemInfo?.name || 'Redeemed Item'}</span>
                      </td>
                      <td className="py-4 font-mono text-xs text-gray-400">{claim.id}</td>
                      <td className="py-4 text-green-700 font-bold">⭐ {claim.points_spent} pts</td>
                      <td className="py-4 text-xs text-gray-500">
                        {new Date(claim.created_at).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}