'use client';

import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompletePickupPage({ params }: PageProps) {
  const resolvedParams = use(params);
  
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
        <h1 className="font-display text-4xl font-bold text-green-950 mb-6 font-semibold">
          Complete Pickup #{resolvedParams.id}
        </h1>
        <div className="auth-card rounded-3xl p-8 border border-green-100 text-center text-gray-600">
          📝 Verification and points awarding interface for pickup request #{resolvedParams.id} is being set up.
        </div>
      </main>
    </>
  );
}
