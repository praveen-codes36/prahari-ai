// In-memory cache for reverse geocoding to prevent repetitive requests and avoid 429 Too Many Requests
const geocodeCache = new Map<string, { address: string; city: string }>();

// Well-known Prayagraj landmarks and corridors for instant fallback matching
const KNOWN_LANDMARKS: Array<{ lat: number; lng: number; radius: number; address: string; city: string }> = [
  { lat: 25.4520, lng: 81.8360, radius: 0.02, address: 'Mahatma Gandhi (MG) Marg', city: 'Prayagraj' },
  { lat: 25.4620, lng: 81.8260, radius: 0.02, address: 'Stanley Road', city: 'Prayagraj' },
  { lat: 25.4358, lng: 81.8463, radius: 0.015, address: 'Civil Lines Central', city: 'Prayagraj' },
  { lat: 25.4410, lng: 81.8260, radius: 0.015, address: 'SRN Hospital Corridor', city: 'Prayagraj' },
  { lat: 25.4480, lng: 81.8290, radius: 0.015, address: 'Kamla Nehru Road', city: 'Prayagraj' },
  { lat: 25.4600, lng: 81.8150, radius: 0.015, address: 'Balson Chauraha Area', city: 'Prayagraj' },
  { lat: 25.4310, lng: 81.8330, radius: 0.015, address: 'Katra Commercial Corridor', city: 'Prayagraj' },
  { lat: 25.4200, lng: 81.8600, radius: 0.03, address: 'Triveni Sangam Road', city: 'Prayagraj' },
];

function getClosestKnownLandmark(lat: number, lng: number): { address: string; city: string } | null {
  for (const lm of KNOWN_LANDMARKS) {
    const dLat = lat - lm.lat;
    const dLng = lng - lm.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    if (dist <= lm.radius) {
      return { address: lm.address, city: lm.city };
    }
  }
  return null;
}

// In-flight request map for deduplication
const pendingRequests = new Map<string, Promise<{ address: string; city: string }>>();

export const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string; city: string }> => {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return { address: 'Prayagraj Corridor', city: 'Prayagraj' };
  }

  // Key rounded to ~100m for cache hits
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;

  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Prayagraj';
      const road = data.address?.road || '';
      const neighbourhood = data.address?.neighbourhood || data.address?.suburb || '';

      let formattedAddress = '';
      if (road && neighbourhood) {
        formattedAddress = `${road}, ${neighbourhood}`;
      } else if (road) {
        formattedAddress = road;
      } else if (neighbourhood) {
        formattedAddress = neighbourhood;
      } else {
        formattedAddress = data.display_name?.split(',').slice(0, 2).join(',') || 'Prayagraj Area';
      }

      const result = { address: formattedAddress, city };
      geocodeCache.set(cacheKey, result);
      return result;
    } catch {
      // Graceful fallback to known landmark or coordinates
      const fallback = getClosestKnownLandmark(lat, lng) || {
        address: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
        city: 'Prayagraj'
      };
      geocodeCache.set(cacheKey, fallback);
      return fallback;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};
