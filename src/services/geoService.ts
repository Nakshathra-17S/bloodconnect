/**
 * Authoritative Mysuru District Boundary Definition & Geospatial Verification Service
 *
 * ABSOLUTE GEOGRAPHICAL RESTRICTION:
 * BloodConnect is strictly restricted to Mysuru District, Karnataka, India.
 * Reject any coordinates, donors, or hospitals outside this perimeter.
 */

// Official approximate bounding perimeter coordinates for Mysuru District
// Encapsulating all 9 taluks: Mysuru City & Rural, T. Narasipura, Nanjangud,
// H.D. Kote, Hunsur, Piriyapatna, K.R. Nagar, Sargur, Saligrama.
export const MYSURU_DISTRICT_POLYGON: [number, number][] = [
  // [Latitude, Longitude]
  [12.6350, 76.2200], // North-West border (near Saligrama / Holenarasipura border)
  [12.6500, 76.4200], // KR Nagar North border
  [12.5900, 76.6800], // KRS Dam / Srirangapatna boundary
  [12.5100, 76.8800], // Bannur / Mandya boundary
  [12.4100, 77.0200], // T. Narasipura East
  [12.2100, 77.0800], // East border towards Malavalli / Kollegala
  [12.0200, 76.9200], // South-East (Nanjangud / Chamarajanagar border)
  [11.8200, 76.7100], // Gundlupet border
  [11.7100, 76.4800], // Bandipur National Park northern buffer / HD Kote border
  [11.7500, 76.2200], // Sargur / Kerala Wayanad border
  [11.9600, 76.0800], // HD Kote / Kabini reservoir western perimeter
  [12.1800, 75.9800], // Nagarahole / Hunsur south-west
  [12.3800, 75.9200], // Piriyapatna / Kodagu boundary
  [12.5200, 76.0500], // Piriyapatna North / Hassan border
  [12.6350, 76.2200], // Closing polygon vertex
];

// District Geographic Center (Mysuru Palace / City core)
export const MYSURU_CENTER: [number, number] = [12.3051, 76.6551];

// Bounding box for rapid screening before polygon ray-casting
export const MYSURU_BBOX = {
  minLat: 11.6800,
  maxLat: 12.6800,
  minLng: 75.8800,
  maxLng: 77.1200,
};

// 9 Official Taluks of Mysuru District
export const MYSURU_TALUKS = [
  'Mysuru City & Rural',
  'Tirumakudalu Narasipura (T. Narasipura)',
  'Nanjangud',
  'Heggadadevanakote (H.D. Kote)',
  'Hunsur',
  'Piriyapatna',
  'Krishnarajanagara (K.R. Nagar)',
  'Sargur',
  'Saligrama',
] as const;

export type MysuruTaluk = (typeof MYSURU_TALUKS)[number];

export const MYSURU_RESTRICTION_MESSAGE =
  'BloodConnect is currently available only within Mysuru district, Karnataka.';

export interface GeoValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Standard Ray-Casting algorithm for Point-In-Polygon test.
 * Latitude is Y, Longitude is X.
 */
export function isPointInsidePolygon(point: [number, number], vs: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const [latI, lngI] = vs[i];
    const [latJ, lngJ] = vs[j];

    const intersect =
      latI > lat !== latJ > lat &&
      lng < ((lngJ - lngI) * (lat - latI)) / (latJ - latI) + lngI;

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Validates whether latitude and longitude are strictly within Mysuru district.
 * Reusable location-validation service enforcing system-level restriction.
 */
export function validateMysuruLocation(latitude: number, longitude: number): GeoValidationResult {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return {
      isValid: false,
      message: 'Invalid coordinates provided. Numbers required.',
    };
  }

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      isValid: false,
      message: 'Coordinates cannot be NaN.',
    };
  }

  // 1. Fast bounding box check
  if (
    latitude < MYSURU_BBOX.minLat ||
    latitude > MYSURU_BBOX.maxLat ||
    longitude < MYSURU_BBOX.minLng ||
    longitude > MYSURU_BBOX.maxLng
  ) {
    return {
      isValid: false,
      message: MYSURU_RESTRICTION_MESSAGE,
    };
  }

  // 2. Authoritative point-in-polygon verification
  const inside = isPointInsidePolygon([latitude, longitude], MYSURU_DISTRICT_POLYGON);
  if (!inside) {
    return {
      isValid: false,
      message: MYSURU_RESTRICTION_MESSAGE,
    };
  }

  return {
    isValid: true,
    message: 'Verified inside Mysuru district, Karnataka.',
  };
}

/**
 * Haversine formula to compute distance in kilometers between two points within Mysuru district.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
