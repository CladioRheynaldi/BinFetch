'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { requestLocation } from '@/lib/location';
import { Coordinates } from '@/types/location';


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLocation?: Coordinates;
  height?: string;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialLocation,
  height = '400px',
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | undefined>(initialLocation);
  
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  
  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500);
  };

  
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setCurrentLocation({ lat, lng });
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
      markerRef.current.bindPopup('Selected location').openPopup();
    }
    onLocationSelect(lat, lng, suggestion.display_name);
  };

  
  const handleUseMyLocation = async () => {
    setLoading(true);
    setError(null);
    const location = await requestLocation();
    if (location) {
      const newLoc = { lat: location.lat, lng: location.lng };
      setCurrentLocation(newLoc);
      
      let address = '';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
        );
        const data = await response.json();
        if (data && data.display_name) {
          setSearchQuery(data.display_name);
          address = data.display_name;
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([location.lat, location.lng], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([location.lat, location.lng]);
        } else {
          markerRef.current = L.marker([location.lat, location.lng]).addTo(mapInstanceRef.current);
        }
        markerRef.current.bindPopup('Your location').openPopup();
      }
      onLocationSelect(location.lat, location.lng, address);
    }
    setLoading(false);
  };

  
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = currentLocation
      ? [currentLocation.lat, currentLocation.lng]
      : [-6.200000, 106.816666]; 

    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    
    mapInstanceRef.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current!);
      }
      setCurrentLocation({ lat, lng });
      setSearchQuery('');
      
      let address = '';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        if (data && data.display_name) {
          setSearchQuery(data.display_name);
          address = data.display_name;
        }
      } catch (err) {
        console.error('Reverse geocoding error:', err);
      }
      
      onLocationSelect(lat, lng, address);
    });

    
    if (currentLocation) {
      markerRef.current = L.marker([currentLocation.lat, currentLocation.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('Selected location')
        .openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); 

  
  useEffect(() => {
    if (currentLocation && mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
        mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lng], 15);
      }
    }
  }, [currentLocation]);

  return (
    <div className="space-y-3">
      {}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for an address..."
          value={searchQuery}
          onChange={(e) => handleSearchInput(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
        {isSearching && <div className="text-xs text-gray-500 mt-1">Searching...</div>}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto mt-1">
            {suggestions.map((sug, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(sug)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {sug.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseMyLocation}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Locating...' : '📍 Use my current location'}
      </button>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      
      <div
        ref={mapRef}
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        className="border border-gray-300 shadow-sm"
      />
      <p className="text-xs text-gray-500">
        Click on the map, type an address, or use the button above to set pickup location.
      </p>
    </div>
  );
}