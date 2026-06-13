'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChatDrawer from '@/components/shared/ChatDrawer';

interface PickupRequest {
  id: string;
  waste_type: string;
  volume_kg: number;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  status: string;
  special_instructions?: string;
  points_awarded?: number;
  created_at: string;
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

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  const [chatOpen, setChatOpen] = useState(false);
  const [activePickupId, setActivePickupId] = useState('');
  const [activeRecipient, setActiveRecipient] = useState('');
  const [myUserId, setMyUserId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMyUserId(localStorage.getItem('bf_user_id') || '');
    }
  }, []);

  const openChat = (pickupId: string, recipient: string) => {
    setActivePickupId(pickupId);
    setActiveRecipient(recipient);
    setChatOpen(true);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('bf_token');
        if (!token) {
          setError('Please login to view your requests.');
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/pickup/my-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch request history');
        }

        const data = await response.json();
        setRequests(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
        {}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-green-950">
              My Pickup Requests
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage all your scheduled waste collection requests.
            </p>
          </div>
          <Link
            href="/request-pickup"
            className="inline-flex justify-center items-center px-6 py-3 bg-[color:var(--green-950)] text-white font-semibold rounded-xl hover:bg-green-900 transition shadow-md md:self-end"
          >
            ♻️ New Pickup Request
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="auth-card rounded-3xl p-6 animate-pulse space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-12 w-full bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="auth-card rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
            <div className="text-5xl">🗑️</div>
            <h3 className="text-2xl font-bold text-green-950">No requests yet</h3>
            <p className="text-gray-600">
              You haven't requested any waste pickups yet. Create your first request to earn points!
            </p>
            <Link
              href="/request-pickup"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Request a Pickup
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requests.map((req) => {
              const status = statusColors[req.status.toLowerCase()] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
              };
              return (
                <div
                  key={req.id}
                  className="auth-card rounded-3xl p-6 flex flex-col justify-between border border-green-100 hover:border-green-300 transition duration-300 shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Top Row: Type & Status */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-green-950">
                        {wasteEmojis[req.waste_type.toLowerCase()] || req.waste_type}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${status.bg} ${status.text}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-semibold text-gray-900">Estimated Weight: </span>
                        {req.volume_kg} kg
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Pickup Address: </span>
                        <p className="mt-1 text-gray-600 italic bg-sand-50 p-2 rounded-lg border border-gray-100">
                          {req.pickup_address}
                        </p>
                      </div>
                      {req.pickup_lat && req.pickup_lng && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <span>📍 Coordinates:</span>
                          <span>
                            {req.pickup_lat.toFixed(6)}, {req.pickup_lng.toFixed(6)}
                          </span>
                        </div>
                      )}
                      {req.special_instructions && (
                        <div>
                          <span className="font-semibold text-gray-900">Special Instructions: </span>
                          <p className="mt-1 text-gray-600 text-xs">{req.special_instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat button prominently inside the request card cell */}
                  {req.status.toLowerCase() !== 'cancelled' && (
                    <div className="mt-4 pt-4 border-t border-green-500/10">
                      <button
                        type="button"
                        onClick={() => openChat(req.id, "Assigned Staff Member")}
                        className="w-full py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl transition font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                      >
                        💬 Chat to Staff
                      </button>
                    </div>
                  )}

                  {/* Footer Row: Date & Points */}
                  <div className="border-t border-green-500/10 mt-6 pt-4 flex items-center justify-between text-xs text-gray-500">
                    <div>
                      {new Date(req.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    {req.status.toLowerCase() === 'completed' && req.points_awarded && (
                      <div className="text-sm font-bold text-green-700">
                        🏆 +{req.points_awarded} Points
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ChatDrawer
        pickupRequestId={activePickupId}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientName={activeRecipient}
        myUserId={myUserId}
      />
    </>
  );
}
