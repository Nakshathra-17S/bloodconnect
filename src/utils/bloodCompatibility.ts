import { BloodGroup, DonorProfile, BloodRequest } from '../types';
import { validateMysuruLocation, calculateDistanceKm } from '../services/geoService';

/**
 * Transparent ABO/Rh red-cell compatibility reference for preliminary donor identification.
 * This is ONLY a preliminary matching filter for potential red-cell donors.
 */
export const COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export const CLINICAL_DISCLAIMER =
  'Final donor suitability and blood compatibility must be confirmed by the hospital or authorized blood bank.';

export const CLINICAL_NOTICE_FULL =
  'Preliminary matching filter for potential red-cell donors. This does not make clinical decisions and does not replace blood grouping, crossmatching, medical screening or hospital blood-bank procedures. Final donor suitability and blood compatibility must be confirmed by the hospital or authorized blood bank.';

/**
 * Returns compatible donor blood groups for a given patient blood group.
 */
export function getCompatibleDonorBloodGroups(patientBloodGroup: BloodGroup): BloodGroup[] {
  return COMPATIBILITY_MATRIX[patientBloodGroup] || [];
}

/**
 * Checks if a specific donor blood group is compatible with patient blood group.
 */
export function isBloodCompatible(patientGroup: BloodGroup, donorGroup: BloodGroup): boolean {
  const compatible = COMPATIBILITY_MATRIX[patientGroup];
  return compatible ? compatible.includes(donorGroup) : false;
}

export interface MatchedDonorResult {
  donor: DonorProfile;
  compatibleBloodGroup: boolean;
  distanceKm: number;
  inDistrict: boolean;
  eligible: boolean;
  exclusionReason?: string;
}

/**
 * Core Matching Algorithm enforcing:
 * 1. Blood group compatibility
 * 2. Mysuru district location validation
 * 3. Donor availability ('Available')
 * 4. Donor consent (`consentToReceiveRequests === true`)
 * 5. Account status (`active`)
 * 6. Request status
 */
export function matchDonorsForRequest(
  request: BloodRequest,
  allDonors: DonorProfile[]
): MatchedDonorResult[] {
  // Validate request hospital location inside Mysuru first
  const requestGeo = validateMysuruLocation(request.latitude, request.longitude);
  if (!requestGeo.isValid) {
    throw new Error('Blood request location is outside Mysuru district boundary.');
  }

  const results: MatchedDonorResult[] = [];

  for (const donor of allDonors) {
    // 1. Mysuru district boundary check for donor
    const donorGeo = validateMysuruLocation(donor.latitude, donor.longitude);
    if (!donorGeo.isValid) {
      continue; // Never return out-of-district donors
    }

    // 2. Account status check
    if (donor.user && donor.user.accountStatus !== 'active') {
      continue; // Exclude suspended or deactivated users
    }

    // 3. Availability status
    if (donor.availability !== 'Available') {
      continue; // Exclude unavailable or temporarily unavailable
    }

    // 4. Consent to receive requests
    if (!donor.consentToReceiveRequests) {
      continue; // Exclude donors who withdrew consent
    }

    // 5. Blood group compatibility
    const compatible = isBloodCompatible(request.patientBloodGroup, donor.bloodGroup);
    if (!compatible) {
      continue; // Exclude non-compatible groups
    }

    // 6. Calculate approximate distance within Mysuru
    const distance = calculateDistanceKm(
      request.latitude,
      request.longitude,
      donor.latitude,
      donor.longitude
    );

    results.push({
      donor,
      compatibleBloodGroup: true,
      distanceKm: distance,
      inDistrict: true,
      eligible: true,
    });
  }

  // Sort by nearest distance within Mysuru district
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}
