"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Pickup {
  id: string;
  waste_type: string;
  volume_kg: number;
  status: string;
  created_at: string;
}

export default function StaffRecentAssignments() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPickups = async () => {
      try {
        const token = localStorage.getItem("bf_token");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/staff/pickup/assigned`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPickups(data.slice(0, 5));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPickups();
  }, []);

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <section className="auth-card rounded-3xl p-8">
      <h2 className="font-display text-3xl font-semibold text-[color:var(--green-950)] mb-6">
        Recent Assignments
      </h2>

      {pickups.length === 0 ? (
        <p className="text-gray-500">
          No assigned pickups found.
        </p>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <Link
              key={pickup.id}
              href={`/pickups?id=${pickup.id}&status=${pickup.status}`}
              className="flex items-center justify-between border-b border-green-100 pb-4 hover:bg-green-50/50 p-2 rounded-2xl transition group"
            >
              <div>
                <p className="font-semibold group-hover:text-[var(--green-mid)] transition">
                  {pickup.waste_type}
                </p>

                <p className="text-sm text-gray-500">
                  {pickup.volume_kg} kg
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                {pickup.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}