// Small geospatial helpers shared across controllers (haversine distance, GeoJSON coordinate helpers).
// Kept dependency-free (no turf/geolib) since we only need straight-line distance + coordinate extraction.

const EARTH_RADIUS_METERS = 6371000;

export function toRadians(deg) {
    return (deg * Math.PI) / 180;
}

// coordsA / coordsB are [longitude, latitude] pairs (GeoJSON order)
export function haversineDistanceMeters(coordsA, coordsB) {
    if (!coordsA || !coordsB) return null;
    const [lon1, lat1] = coordsA;
    const [lon2, lat2] = coordsB;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.asin(Math.sqrt(a));
    return EARTH_RADIUS_METERS * c;
}

export function metersToKm(meters) {
    return meters == null ? null : Math.round((meters / 1000) * 10) / 10;
}

// Pulls a representative [lng, lat] point out of any GeoJSON geometry.
// Point returns as-is; LineString/Polygon return their first vertex as an approximation
// (RoadBlockage can be stored as any of these three types per the base schema).
export function extractRepresentativePoint(geometry) {
    if (!geometry || !geometry.coordinates) return null;

    if (geometry.type === "Point") return geometry.coordinates;
    if (geometry.type === "LineString") return geometry.coordinates[0];
    if (geometry.type === "Polygon") return geometry.coordinates[0][0];

    return null;
}
