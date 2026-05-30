"use client";

import { useEffect, useState } from "react";

interface PickupRequest {
  id: string;
  waste_type: string;
  volume_kg: number;
  status: string;
  created_at: string;
}

export default function RecentActivity() {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("bf_token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/pickup/my-requests`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setRequests(data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load requests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <section className="auth-card rounded-3xl p-8">
        Loading recent activity...
      </section>
    );
  }

  return (
    <section className="auth-card rounded-3xl p-8">
      <h2 className="font-display text-3xl font-bold text-green-950 mb-6">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-500">
            No pickup requests found.
          </p>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between border-b border-green-100 pb-4"
            >
              <div>
                <p className="font-semibold">
                  {request.waste_type}
                </p>

                <p className="text-sm text-gray-500">
                  {request.volume_kg} kg
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                {request.status}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}