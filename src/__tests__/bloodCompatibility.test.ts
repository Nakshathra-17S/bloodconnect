import { describe, it, expect } from './testRunner';
import {
  COMPATIBILITY_MATRIX,
  isBloodCompatible,
  getCompatibleDonorBloodGroups,
  matchDonorsForRequest,
} from '../utils/bloodCompatibility';
import { BloodRequest, DonorProfile } from '../types';

describe('ABO / Rh Red-Cell Compatibility & Matching Rules', () => {
  it('correctly returns compatible blood groups for O+ patient', () => {
    const compatible = getCompatibleDonorBloodGroups('O+');
    expect(compatible).toEqual(['O+', 'O-']);
  });

  it('correctly matches AB+ patient as compatible with all eight groups', () => {
    const compatible = getCompatibleDonorBloodGroups('AB+');
    expect(compatible.length).toBe(8);
  });

  it('correctly matches O- patient with only O- donors', () => {
    const compatible = getCompatibleDonorBloodGroups('O-');
    expect(compatible).toEqual(['O-']);
  });

  it('correctly filters compatible donors in multi-criteria algorithm', () => {
    const mockRequest: BloodRequest = {
      id: 'req-test-1',
      requesterId: 'user-seeker-1',
      patientName: 'Test Patient',
      patientBloodGroup: 'A+',
      unitsRequired: 1,
      urgency: 'Urgent',
      hospitalName: 'Apollo BGS Hospital',
      hospitalAddress: 'Kuvempunagar',
      locality: 'Mysuru City & Rural',
      latitude: 12.2882,
      longitude: 76.6268,
      hospitalContactNumber: '+91 821 256 8888',
      requiredAt: new Date().toISOString(),
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockDonors: DonorProfile[] = [
      {
        id: 'donor-1',
        userId: 'u1',
        dateOfBirth: '1995-01-01',
        bloodGroup: 'A+', // compatible
        address: 'Mysuru',
        locality: 'Mysuru City & Rural',
        latitude: 12.3021,
        longitude: 76.6341,
        availability: 'Available',
        consentToReceiveRequests: true,
        consentToShareContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 'u1', fullName: 'Donor 1', phone: '123', email: 'd1@m.org', role: 'donor', accountStatus: 'active', createdAt: '', updatedAt: '' },
      },
      {
        id: 'donor-2',
        userId: 'u2',
        dateOfBirth: '1995-01-01',
        bloodGroup: 'B+', // NOT compatible with A+
        address: 'Mysuru',
        locality: 'Mysuru City & Rural',
        latitude: 12.3021,
        longitude: 76.6341,
        availability: 'Available',
        consentToReceiveRequests: true,
        consentToShareContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 'u2', fullName: 'Donor 2', phone: '123', email: 'd2@m.org', role: 'donor', accountStatus: 'active', createdAt: '', updatedAt: '' },
      },
      {
        id: 'donor-3',
        userId: 'u3',
        dateOfBirth: '1995-01-01',
        bloodGroup: 'O-', // compatible, but unavailable
        address: 'Mysuru',
        locality: 'Mysuru City & Rural',
        latitude: 12.3021,
        longitude: 76.6341,
        availability: 'Unavailable', // should be excluded
        consentToReceiveRequests: true,
        consentToShareContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 'u3', fullName: 'Donor 3', phone: '123', email: 'd3@m.org', role: 'donor', accountStatus: 'active', createdAt: '', updatedAt: '' },
      },
      {
        id: 'donor-4',
        userId: 'u4',
        dateOfBirth: '1995-01-01',
        bloodGroup: 'O+', // compatible, but out of district (Bengaluru)
        address: 'Bengaluru',
        locality: 'Bengaluru',
        latitude: 12.9716, // OUT OF DISTRICT
        longitude: 77.5946,
        availability: 'Available',
        consentToReceiveRequests: true,
        consentToShareContact: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 'u4', fullName: 'Donor 4', phone: '123', email: 'd4@m.org', role: 'donor', accountStatus: 'active', createdAt: '', updatedAt: '' },
      },
    ];

    const matched = matchDonorsForRequest(mockRequest, mockDonors);

    // Only donor-1 should match!
    expect(matched.length).toBe(1);
    expect(matched[0].donor.id).toBe('donor-1');
  });
});
