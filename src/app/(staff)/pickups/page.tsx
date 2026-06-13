'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatDrawer from '@/components/shared/ChatDrawer';

interface Pickup {
  id: string;
  waste_type: string;
  volume_kg: number;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  status: string;
  special_instructions?: string;
  created_at: string;
  assigned_staff_id?: string;
  user_id?: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-800' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-800' },
  processing: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  cancelled: { bg: 'bg-rose-100', text: 'text-rose-800' },
};

const wasteEmojis: Record<string, string> = {
  plastic: '♻️ Plastic',
  electronic: '📱 Electronic',
  organic: '🍌 Organic',
  paper: '📄 Paper & Cardboard',
  mixed: '🗑️ Mixed',
};

function StaffPickupsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [staffId, setStaffId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  
  const [chatOpen, setChatOpen] = useState(false);
  const [activePickupId, setActivePickupId] = useState('');
  const [activeRecipient, setActiveRecipient] = useState('');

  const openChat = (pickupId: string, recipient: string) => {
    setActivePickupId(pickupId);
    setActiveRecipient(recipient);
    setChatOpen(true);
  };
  
  
  const [activeTab, setActiveTab] = useState<'assigned' | 'ongoing' | 'history'>('assigned');
  
  
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    actual_waste_type: 'plastic',
    actual_volume_kg: 1,
    use_manual_points: false,
    manual_points: 10,
  });

  
  const targetId = searchParams?.get('id');
  const targetStatus = searchParams?.get('status');

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    try {
      
      const assignedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/assigned`, { headers });
      const assignedData = await assignedRes.ok ? await assignedRes.json() : [];

      
      const pendingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup`, { headers });
      const pendingData = await pendingRes.ok ? await pendingRes.json() : [];

      
      const combined = [...assignedData];
      pendingData.forEach((pending: Pickup) => {
        if (!combined.some(c => c.id === pending.id)) {
          combined.push(pending);
        }
      });

      setPickups(combined);
    } catch (err: any) {
      setError('Failed to load pickups. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStaffId(localStorage.getItem('bf_user_id'));
    }
    loadAllData();
  }, []);

  
  useEffect(() => {
    if (targetStatus) {
      const statusLower = targetStatus.toLowerCase();
      if (statusLower === 'pending') {
        setActiveTab('assigned'); 
      } else if (statusLower === 'completed' || statusLower === 'cancelled') {
        setActiveTab('history');
      } else {
        setActiveTab('ongoing'); 
      }
    }
  }, [targetStatus]);

  
  useEffect(() => {
    if (targetId && pickups.length > 0) {
      const found = pickups.find(p => p.id === targetId);
      if (found) {
        
        if (found.status.toLowerCase() === 'processing') {
          setCompletingId(targetId);
          setCompleteForm({
            actual_waste_type: found.waste_type,
            actual_volume_kg: found.volume_kg,
            use_manual_points: false,
            manual_points: found.volume_kg * 10,
          });
        }
        
        
        setTimeout(() => {
          const el = document.getElementById(`pickup-card-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [targetId, pickups]);

  const handleAction = async (pickupId: string, action: 'accept' | 'process' | 'cancel') => {
    if (actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      setActionLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/${pickupId}/${action}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to ${action} pickup`);
      }

      setSuccessMsg(
        action === 'accept'
          ? '✅ Pickup accepted successfully! It is now in your Ongoing Collections.'
          : action === 'cancel'
          ? '✅ Pickup declined/cancelled successfully and reassigned back to the pool.'
          : '✅ Pickup is now in progress!'
      );
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent, pickupId: string) => {
    e.preventDefault();
    if (actionLoading) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    const token = localStorage.getItem('bf_token');
    if (!token) {
      setActionLoading(false);
      return;
    }

    try {
      const payload: any = {
        actual_waste_type: completeForm.actual_waste_type,
        actual_volume_kg: Number(completeForm.actual_volume_kg),
      };

      if (completeForm.use_manual_points) {
        payload.manual_points = Number(completeForm.manual_points);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/${pickupId}/complete`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to complete pickup');
      }

      setSuccessMsg('🎉 Pickup successfully completed! Points awarded to the customer.');
      setCompletingId(null);
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredPickups = () => {
    if (!staffId) return [];
    
    if (activeTab === 'assigned') {
      
      return pickups.filter(
        p => p.assigned_staff_id === staffId && 
        p.status.toLowerCase() === 'pending'
      );
    } else if (activeTab === 'ongoing') {
      
      return pickups.filter(
        p => p.assigned_staff_id === staffId && 
        ['accepted', 'processing'].includes(p.status.toLowerCase())
      );
    } else {
      
      return pickups.filter(
        p => p.assigned_staff_id === staffId && 
        ['completed', 'cancelled'].includes(p.status.toLowerCase())
      );
    }
  };

  const filteredList = getFilteredPickups();

  const assignedCount = staffId ? pickups.filter(p => p.assigned_staff_id === staffId && p.status.toLowerCase() === 'pending').length : 0;
  const ongoingCount = staffId ? pickups.filter(p => p.assigned_staff_id === staffId && ['accepted', 'processing'].includes(p.status.toLowerCase())).length : 0;
  const historyCount = staffId ? pickups.filter(p => p.assigned_staff_id === staffId && ['completed', 'cancelled'].includes(p.status.toLowerCase())).length : 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      {}
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">
          Operations
        </span>
        <h1 className="font-display text-4xl font-bold text-green-950 font-semibold">
          Pickup Assignments Dashboard
        </h1>
        <p className="text-gray-600 mt-2 font-medium">
          Accept or decline assignments, manage ongoing collections, and log recycling completions.
        </p>
      </div>

      {}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-semibold animate-pulse">
          {successMsg}
        </div>
      )}

      {}
      <div className="flex border-b border-green-200 mb-8 gap-6 text-sm font-semibold">
        <button
          onClick={() => { setActiveTab('assigned'); setCompletingId(null); }}
          className={`pb-4 transition ${
            activeTab === 'assigned'
              ? 'text-green-700 border-b-2 border-green-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Assigned Requests ({assignedCount})
        </button>

        <button
          onClick={() => { setActiveTab('ongoing'); setCompletingId(null); }}
          className={`pb-4 transition ${
            activeTab === 'ongoing'
              ? 'text-green-700 border-b-2 border-green-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Ongoing Collections ({ongoingCount})
        </button>

        <button
          onClick={() => { setActiveTab('history'); setCompletingId(null); }}
          className={`pb-4 transition ${
            activeTab === 'history'
              ? 'text-green-700 border-b-2 border-green-700 font-bold'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          History Requests ({historyCount})
        </button>
      </div>

      {}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="auth-card rounded-3xl p-6 animate-pulse space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="auth-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="text-5xl">📋</div>
          <h3 className="text-2xl font-bold text-green-950 font-semibold">No pickups found</h3>
          <p className="text-gray-600 font-medium">
            {activeTab === 'assigned'
              ? 'You do not have any new pickups assigned waiting for your acceptance.'
              : activeTab === 'ongoing'
              ? 'You do not have any ongoing active collections. Accept an assigned request first!'
              : 'Your collection log history is currently empty.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredList.map(pickup => {
            const status = statusColors[pickup.status.toLowerCase()] || {
              bg: 'bg-gray-100',
              text: 'text-gray-800',
            };
            const isCompleting = completingId === pickup.id;
            const isTargeted = targetId === pickup.id;

            return (
              <div
                key={pickup.id}
                id={`pickup-card-${pickup.id}`}
                className={`auth-card rounded-3xl p-6 flex flex-col justify-between border transition-all duration-300 shadow-sm ${
                  isTargeted
                    ? 'border-green-600 ring-4 ring-green-100 scale-[1.02] bg-green-50/10 shadow-md'
                    : 'border-green-100 hover:border-green-200'
                }`}
              >
                <div className="space-y-4">
                  {}
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-green-950 font-display">
                      {wasteEmojis[pickup.waste_type.toLowerCase()] || pickup.waste_type}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.bg} ${status.text}`}
                    >
                      {pickup.status}
                    </span>
                  </div>

                  {}
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>
                      <span className="font-semibold text-gray-900">Estimated Volume:</span>{' '}
                      {pickup.volume_kg} kg
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Pickup Address:</span>
                      <p className="mt-1 text-gray-600 italic bg-sand-50 p-2 rounded-lg border border-gray-100 font-medium">
                        {pickup.pickup_address}
                      </p>
                    </div>
                    {pickup.pickup_lat && pickup.pickup_lng && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                        <span>📍 Coordinates:</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${pickup.pickup_lat},${pickup.pickup_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {pickup.pickup_lat.toFixed(6)}, {pickup.pickup_lng.toFixed(6)} 🔗
                        </a>
                      </div>
                    )}
                    {pickup.special_instructions && (
                      <div className="text-xs font-medium">
                        <span className="font-semibold text-gray-900">Special Instructions:</span>{' '}
                        <span className="text-gray-500">{pickup.special_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                {}
                {isCompleting ? (
                  <form
                    onSubmit={(e) => handleCompleteSubmit(e, pickup.id)}
                    className="mt-6 pt-6 border-t border-green-500/10 space-y-4 bg-green-50/50 p-4 rounded-2xl"
                  >
                    <h3 className="font-bold text-green-950 text-sm uppercase tracking-wider font-display">
                      📝 Complete Collection Verification
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Actual Waste Category *
                      </label>
                      <select
                        value={completeForm.actual_waste_type}
                        onChange={(e) =>
                          setCompleteForm({ ...completeForm, actual_waste_type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                        required
                      >
                        <option value="plastic">♻️ Plastic</option>
                        <option value="electronic">📱 Electronic</option>
                        <option value="organic">🍌 Organic</option>
                        <option value="paper">📄 Paper & Cardboard</option>
                        <option value="mixed">🗑️ Mixed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Actual Weight (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="500"
                        value={completeForm.actual_volume_kg}
                        onChange={(e) =>
                          setCompleteForm({
                            ...completeForm,
                            actual_volume_kg: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`override-${pickup.id}`}
                        checked={completeForm.use_manual_points}
                        onChange={(e) =>
                          setCompleteForm({
                            ...completeForm,
                            use_manual_points: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor={`override-${pickup.id}`} className="text-xs font-semibold text-gray-700">
                        Manually override award points
                      </label>
                    </div>

                    {completeForm.use_manual_points && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Manual Points *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={completeForm.manual_points}
                          onChange={(e) =>
                            setCompleteForm({
                              ...completeForm,
                              manual_points: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                          required
                        />
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setCompletingId(null)}
                        disabled={actionLoading}
                        className="px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-3 py-2 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Saving...' : 'Finish & Award Points'}
                      </button>
                    </div>
                  </form>
                ) : (
                  
                  <div className="border-t border-green-500/10 mt-6 pt-4 flex flex-col gap-2">
                    
                    {}
                    {activeTab === 'assigned' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAction(pickup.id, 'accept')}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-800 transition font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          🤝 Accept Pickup
                        </button>
                        <button
                          onClick={() => handleAction(pickup.id, 'cancel')}
                          disabled={actionLoading}
                          className="flex-1 py-2.5 border border-rose-600 text-rose-600 rounded-xl hover:bg-rose-50 transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Decline Request
                        </button>
                      </div>
                    )}

                    {}
                    {activeTab === 'ongoing' && (
                      <div className="flex flex-col gap-2">
                        {pickup.status.toLowerCase() === 'accepted' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(pickup.id, 'process')}
                              disabled={actionLoading}
                              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              🚀 Start Processing
                            </button>
                            <button
                              onClick={() => handleAction(pickup.id, 'cancel')}
                              disabled={actionLoading}
                              className="py-2.5 px-4 border border-rose-600 text-rose-600 rounded-xl hover:bg-rose-50 transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {pickup.status.toLowerCase() === 'processing' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCompletingId(pickup.id);
                                setCompleteForm({
                                  actual_waste_type: pickup.waste_type,
                                  actual_volume_kg: pickup.volume_kg,
                                  use_manual_points: false,
                                  manual_points: pickup.volume_kg * 10,
                                });
                              }}
                              disabled={actionLoading}
                              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✅ Complete Collection
                            </button>
                            <button
                              onClick={() => handleAction(pickup.id, 'cancel')}
                              disabled={actionLoading}
                              className="py-2.5 px-4 border border-rose-600 text-rose-600 rounded-xl hover:bg-rose-50 transition font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => openChat(pickup.id, "Customer")}
                            className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                          >
                            💬 Chat with Customer
                          </button>
                        </div>
                      </div>
                    )}

                    {}
                    {activeTab === 'history' && (
                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold">
                        <span>
                          {new Date(pickup.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {pickup.status.toLowerCase() === 'completed' && (
                          <span className="font-bold text-green-700 bg-emerald-50 px-2 py-1 rounded">
                            Completed & Logged
                          </span>
                        )}
                        {pickup.status.toLowerCase() === 'cancelled' && (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded">
                            Declined / Cancelled
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ChatDrawer
        pickupRequestId={activePickupId}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientName={activeRecipient}
        myUserId={staffId || ''}
      />
    </main>
  );
}

export default function StaffPickupsPage() {
  return (
    <Suspense fallback={
      <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen animate-pulse space-y-8">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="auth-card rounded-3xl p-6 h-48 bg-gray-200"></div>
          ))}
        </div>
      </main>
    }>
      <StaffPickupsContent />
    </Suspense>
  );
}
