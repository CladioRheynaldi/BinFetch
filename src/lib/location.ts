import { UserLocation } from '@/types/location';

/**
 * Get the user's current geographic position using the browser's Geolocation API.
 * @returns Promise<UserLocation>
 * @throws Error if geolocation is not supported, permission denied, or timeout.
 */
export async function getCurrentPosition(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message = 'Unable to retrieve your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,   // Use GPS if available
        timeout: 10000,             // 10 seconds max
        maximumAge: 0,              // Don't use cached location
      }
    );
  });
}

/**
 * Check the current permission state for geolocation.
 * @returns 'granted' | 'denied' | 'prompt'
 */
export async function checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions) {
    return 'prompt'; // Fallback for older browsers
  }
  const result = await navigator.permissions.query({ name: 'geolocation' });
  return result.state;
}

/**
 * Request location with a user-friendly permission flow.
 * @returns UserLocation | null (null if permission denied or error)
 */
export async function requestLocation(): Promise<UserLocation | null> {
  const permissionState = await checkLocationPermission();

  if (permissionState === 'denied') {
    alert('Location access is blocked. Please enable it in your browser settings to use this feature.');
    return null;
  }

  try {
    const location = await getCurrentPosition();
    return location;
  } catch (error) {
    console.error('Location error:', error);
    alert(error instanceof Error ? error.message : 'Could not get location');
    return null;
  }
}