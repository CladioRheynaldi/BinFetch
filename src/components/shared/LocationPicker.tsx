// components/LocationPicker.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix Leaflet icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation, 
  height = '400px' 
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's current location
  const getUserLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      setLocation(newLocation);
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([newLocation.lat, newLocation.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        } else {
          markerRef.current = L.marker([newLocation.lat, newLocation.lng])
            .addTo(mapInstanceRef.current)
            .bindPopup('Your location')
            .openPopup();
        }
      }
      
      onLocationSelect(newLocation.lat, newLocation.lng);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not get your location');
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultLocation: [number, number] = location 
      ? [location.lat, location.lng] 
      : [-6.200000, 106.816666]; // Jakarta as default

    mapInstanceRef.current = L.map(mapRef.current).setView(defaultLocation, 13);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    // Add click handler to place marker
    mapInstanceRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current!);
      }
      
      setLocation({ lat, lng });
      onLocationSelect(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when location changes externally
  useEffect(() => {
    if (location && mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapInstanceRef.current.setView([location.lat, location.lng], 15);
    }
  }, [location]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={getUserLocation}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Getting location...' : '📍 Use my current location'}
      </button>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      <div 
        ref={mapRef} 
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        className="border border-gray-200"
      />
    </div>
  );
}