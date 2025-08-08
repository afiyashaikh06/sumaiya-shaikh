import { GeoPoint } from '../models';

const EARTH_RADIUS_KM = 6371;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

export type Stop = {
  id: string;
  location: GeoPoint;
};

export type OptimizedRoute = {
  order: string[]; // ordered stop ids
  totalDistanceKm: number;
};

export function nearestNeighborRoute(start: GeoPoint, stops: Stop[], returnToStart = false): OptimizedRoute {
  if (stops.length === 0) return { order: [], totalDistanceKm: 0 };

  const remaining = [...stops];
  let currentPoint = start;
  const visitOrder: string[] = [];
  let totalDistanceKm = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      const d = haversineDistanceKm(currentPoint, candidate.location);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    const next = remaining.splice(bestIdx, 1)[0];
    visitOrder.push(next.id);
    totalDistanceKm += bestDist;
    currentPoint = next.location;
  }

  if (returnToStart) {
    totalDistanceKm += haversineDistanceKm(currentPoint, start);
  }

  return { order: visitOrder, totalDistanceKm };
}