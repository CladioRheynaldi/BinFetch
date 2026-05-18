'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/shared/LocationPicker';

const wasteTypes = [
  { value: 'plastic', label: '♻️ Plastic' },
  { value: 'electronic', label: '📱 Electronic Waste' },
  { value: 'organic', label: '🍌 Organic Waste' },
  { value: 'paper', label: '📄 Paper & Cardboard' },
  { value: 'mixed', label: '🗑️ Mixed Recycling' },
];

export default function RequestPickupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState({
    waste_type: 'plastic',
    estimated_volume_kg: 1,
    pickup_address: '',
    special_instructions: '',
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    // Optional: you could reverse geocode here to auto-fill address
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login again');
      router.push('/login');
      return;
    }

    // Validate that a location is selected
    if (!coordinates) {
      setError('Please select a pickup location on the map.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          waste_type: formData.waste_type,
          estimated_volume_kg: formData.estimated_volume_kg,
          pickup_address: formData.pickup_address,
          special_instructions: formData.special_instructions,
          pickup_lat: coordinates.lat,
          pickup_lng: coordinates.lng,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create pickup request');
      }

      const result = await response.json();
      alert(`✅ Pickup request created! Your request is pending.`);
      router.push('/customer/my-requests');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-6">
            <h1 className="text-3xl font-bold text-green-700 mb-2">Request a Pickup</h1>
            <p className="text-gray-600 mb-6">
              Schedule waste collection. We'll assign a staff member to you.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waste Type *
                </label>
                <select
                  value={formData.waste_type}
                  onChange={(e) => setFormData({ ...formData, waste_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                >
                  {wasteTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Volume (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="500"
                  value={formData.estimated_volume_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_volume_kg: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Approximate weight – staff will verify actual weight later.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Address *
                </label>
                <textarea
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Street, building, landmark, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location on Map *
                </label>
                <LocationPicker onLocationSelect={handleLocationSelect} height="350px" />
                {coordinates && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Location set: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, special_instructions: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Gate code, floor number, etc."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Request Pickup'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}