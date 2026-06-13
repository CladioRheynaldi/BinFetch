'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Redemption {
  id: string;
  customer_id: string;
  customer_name: string;
  item_id: string;
  points_spent: number;
  status: string;
  notes?: string;
  created_at: string;
  reward_items?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

export default function StaffManagePage() {
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRedemptions = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/redemptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch redemption records');
      }

      const data = await response.json();
      setRedemptions(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const handleCompleteRedemption = async (id: string) => {
    if (actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('bf_token');
    if (!token) {
      setActionLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/redemptions/${id}/complete`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to complete redemption');
      }

      setSuccess('🎉 Reward redemption successfully completed and handed over.');
      await fetchRedemptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen space-y-8">
      <div className="border-b border-green-50 pb-6">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">
          Operations
        </span>
        <h1 className="font-display text-4xl font-bold text-green-950 font-semibold">
          Reward Exchanges & Redemptions
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Track and process customer rewards redemption claims and point exchange history.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="auth-card rounded-3xl p-6 h-24 bg-gray-100"></div>
          ))}
        </div>
      ) : redemptions.length === 0 ? (
        <div className="auth-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="text-5xl">🎁</div>
          <h3 className="text-2xl font-bold text-green-950">No redemptions found</h3>
          <p className="text-gray-600">
            Customers have not redeemed any points for eco-friendly rewards yet.
          </p>
        </div>
      ) : (
        <div className="auth-card rounded-3xl p-6 bg-white border border-green-50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-4">Reward Item</th>
                  <th className="pb-4">Customer Name</th>
                  <th className="pb-4">Points Spent</th>
                  <th className="pb-4">Date Claimed</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-50 text-sm font-medium text-gray-700">
                {redemptions.map((claim) => {
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
                      <td className="py-4">{claim.customer_name}</td>
                      <td className="py-4 text-green-700 font-bold">⭐ {claim.points_spent} pts</td>
                      <td className="py-4 text-xs text-gray-400">
                        {new Date(claim.created_at).toLocaleString()}
                      </td>
                      <td className="py-4">
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
                      <td className="py-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleCompleteRedemption(claim.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Claim Handed Over</span>
                        )}
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
