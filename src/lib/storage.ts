import {
  UserProfile,
  DonorProfile,
  BloodRequest,
  DonorResponse,
  Hospital,
  NotificationItem,
  AuditLogItem,
} from '../types';

// Pre-seeded verified hospitals strictly inside Mysuru District
const INITIAL_VERIFIED_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    hospitalName: 'Krishna Rajendra (K.R.) Hospital',
    address: 'Irwin Road, Sayyaji Rao Rd, Mandi Mohalla',
    locality: 'Mysuru City & Rural',
    latitude: 12.3168,
    longitude: 76.6508,
    contactNumber: '+91 821 252 0512',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-2',
    hospitalName: 'Apollo BGS Hospitals',
    address: 'Adichunchanagiri Road, Kuvempunagar',
    locality: 'Mysuru City & Rural',
    latitude: 12.2882,
    longitude: 76.6268,
    contactNumber: '+91 821 256 8888',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-3',
    hospitalName: 'JSS Hospital & Research Centre',
    address: 'M.G. Road, Agrahara',
    locality: 'Mysuru City & Rural',
    latitude: 12.3005,
    longitude: 76.6536,
    contactNumber: '+91 821 233 5555',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-4',
    hospitalName: 'Columbia Asia Hospital (Manipal)',
    address: 'Bangalore-Mysore Ring Road, Bannimantap',
    locality: 'Mysuru City & Rural',
    latitude: 12.3484,
    longitude: 76.6434,
    contactNumber: '+91 821 398 9896',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-5',
    hospitalName: 'CSI Holdsworth Memorial (Mission) Hospital',
    address: 'Sayyaji Rao Road, Mandi Mohalla',
    locality: 'Mysuru City & Rural',
    latitude: 12.3195,
    longitude: 76.6542,
    contactNumber: '+91 821 252 0332',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-6',
    hospitalName: 'General Hospital Nanjangud',
    address: 'Rashtrapati Road, Nanjangud Town',
    locality: 'Nanjangud',
    latitude: 12.1193,
    longitude: 76.6806,
    contactNumber: '+91 8221 226 030',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-7',
    hospitalName: 'Taluk General Hospital Hunsur',
    address: 'Bypass Main Road, Hunsur Town',
    locality: 'Hunsur',
    latitude: 12.3090,
    longitude: 76.2917,
    contactNumber: '+91 8222 252 240',
    verificationStatus: 'Verified',
    bloodBankAvailable: true,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-8',
    hospitalName: 'Taluk Hospital T. Narasipura',
    address: 'Vidyodaya College Road, T. Narasipura',
    locality: 'Tirumakudalu Narasipura (T. Narasipura)',
    latitude: 12.2132,
    longitude: 76.9015,
    contactNumber: '+91 8227 260 225',
    verificationStatus: 'Verified',
    bloodBankAvailable: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-9',
    hospitalName: 'Government Taluk Hospital K.R. Nagar',
    address: 'Saligrama Road, Krishnarajanagara',
    locality: 'Krishnarajanagara (K.R. Nagar)',
    latitude: 12.5841,
    longitude: 76.3833,
    contactNumber: '+91 8223 262 231',
    verificationStatus: 'Verified',
    bloodBankAvailable: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'hosp-10',
    hospitalName: 'General Hospital Piriyapatna',
    address: 'B.M. Road, Piriyapatna',
    locality: 'Piriyapatna',
    latitude: 12.3392,
    longitude: 76.0981,
    contactNumber: '+91 8223 274 030',
    verificationStatus: 'Verified',
    bloodBankAvailable: false,
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

// Initial realistic Mysuru District voluntary donors (strict coordinates within Mysuru boundary)
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    fullName: 'District Health Officer (Mysuru)',
    phone: '+91 821 242 2222',
    email: 'admin@bloodconnect.gov.in',
    role: 'administrator',
    accountStatus: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'user-donor-1',
    fullName: 'Voluntary Donor (Mysuru)',
    phone: '+91 98450 11223',
    email: 'donor@mysuru.org',
    role: 'donor',
    accountStatus: 'active',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'user-donor-2',
    fullName: 'Dr. Priya V. Murthy',
    phone: '+91 98860 33445',
    email: 'priya@mysuru.org',
    role: 'donor',
    accountStatus: 'active',
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-12T00:00:00.000Z',
  },
  {
    id: 'user-donor-3',
    fullName: 'Mohammad Farooq',
    phone: '+91 99001 55667',
    email: 'farooq@mysuru.org',
    role: 'donor',
    accountStatus: 'active',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'user-donor-4',
    fullName: 'Lakshmi Prasad',
    phone: '+91 97412 88990',
    email: 'lakshmi@mysuru.org',
    role: 'donor',
    accountStatus: 'active',
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
  },
  {
    id: 'user-seeker-1',
    fullName: 'Patient Representative (Seeker)',
    phone: '+91 98452 77889',
    email: 'seeker@mysuru.org',
    role: 'blood_seeker',
    accountStatus: 'active',
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-01T00:00:00.000Z',
  },
];

const INITIAL_DONORS: DonorProfile[] = [
  {
    id: 'donor-p-1',
    userId: 'user-donor-1',
    dateOfBirth: '1995-04-12',
    bloodGroup: 'O+',
    address: '5th Cross, Saraswathipuram',
    locality: 'Mysuru City & Rural',
    latitude: 12.3021,
    longitude: 76.6341,
    availability: 'Available',
    lastDonationDate: '2024-11-15',
    consentToReceiveRequests: true,
    consentToShareContact: false,
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
  {
    id: 'donor-p-2',
    userId: 'user-donor-2',
    dateOfBirth: '1990-08-22',
    bloodGroup: 'A+',
    address: 'Adichunchanagiri Road, Kuvempunagar',
    locality: 'Mysuru City & Rural',
    latitude: 12.2891,
    longitude: 76.6283,
    availability: 'Available',
    lastDonationDate: '2024-12-01',
    consentToReceiveRequests: true,
    consentToShareContact: false,
    createdAt: '2025-01-12T00:00:00.000Z',
    updatedAt: '2025-01-12T00:00:00.000Z',
  },
  {
    id: 'donor-p-3',
    userId: 'user-donor-3',
    dateOfBirth: '1998-11-05',
    bloodGroup: 'B+',
    address: 'Main Road, Nanjangud',
    locality: 'Nanjangud',
    latitude: 12.1221,
    longitude: 76.6812,
    availability: 'Available',
    lastDonationDate: '2024-10-10',
    consentToReceiveRequests: true,
    consentToShareContact: false,
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'donor-p-4',
    userId: 'user-donor-4',
    dateOfBirth: '1992-02-18',
    bloodGroup: 'O-',
    address: 'B.M. Road, Hunsur',
    locality: 'Hunsur',
    latitude: 12.3082,
    longitude: 76.2941,
    availability: 'Available',
    lastDonationDate: '2024-09-05',
    consentToReceiveRequests: true,
    consentToShareContact: false,
    createdAt: '2025-01-20T00:00:00.000Z',
    updatedAt: '2025-01-20T00:00:00.000Z',
  },
];

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-demo-1',
    requesterId: 'user-seeker-1',
    patientName: 'Ravi Prakash (ICU Bed 4)',
    patientBloodGroup: 'O+',
    unitsRequired: 2,
    urgency: 'Emergency',
    hospitalName: 'Krishna Rajendra (K.R.) Hospital',
    hospitalAddress: 'Irwin Road, Sayyaji Rao Rd, Mandi Mohalla',
    locality: 'Mysuru City & Rural',
    latitude: 12.3168,
    longitude: 76.6508,
    hospitalContactNumber: '+91 821 252 0512',
    requiredAt: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    additionalInformation: 'Urgent emergency surgery scheduled at K.R. Hospital Trauma Ward.',
    status: 'Requests Sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

const INITIAL_RESPONSES: DonorResponse[] = [
  {
    id: 'resp-1',
    requestId: 'req-demo-1',
    donorId: 'donor-p-1',
    responseStatus: 'Accepted',
    contactSharingConsent: true,
    respondedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-donor-1',
    title: 'Emergency Blood Request Match (O+)',
    message: 'K.R. Hospital has an emergency requirement for 2 units of O+ blood.',
    notificationType: 'request',
    isRead: true,
    relatedRequestId: 'req-demo-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-seeker-1',
    title: 'Donor Accepted Request',
    message: 'A voluntary donor (O+) has accepted your blood request for K.R. Hospital and authorized contact sharing.',
    notificationType: 'response',
    isRead: false,
    relatedRequestId: 'req-demo-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit-1',
    actorId: 'user-admin-1',
    actorName: 'District Health Officer (Mysuru)',
    action: 'SYSTEM_INITIALIZATION',
    entityType: 'DISTRICT_POLICY',
    entityId: 'mysuru-district-karnataka',
    details: { boundaryConstraint: 'MYSURU_STRICT_ONLY', taluksCount: 9 },
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'audit-2',
    actorId: 'user-admin-1',
    actorName: 'District Health Officer (Mysuru)',
    action: 'HOSPITAL_VERIFIED',
    entityType: 'HOSPITALS',
    entityId: 'hosp-1',
    details: { hospital: 'Krishna Rajendra (K.R.) Hospital', status: 'Verified' },
    createdAt: '2025-01-01T00:05:00.000Z',
  },
];

class LocalDataStore {
  private get<T>(key: string, defaultVal: T): T {
    try {
      const raw = localStorage.getItem(`bloodconnect_${key}`);
      return raw ? JSON.parse(raw) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private set<T>(key: string, val: T): void {
    try {
      localStorage.setItem(`bloodconnect_${key}`, JSON.stringify(val));
    } catch (err) {
      console.error('Storage write error:', err);
    }
  }

  // PROFILES
  getProfiles(): UserProfile[] {
    const list = this.get<UserProfile[]>('profiles', INITIAL_PROFILES);
    return list.map((p) => {
      if (p.fullName.includes('Chethan') || p.email === 'chethan@mysuru.org') {
        return { ...p, fullName: 'Voluntary Donor (Mysuru)', email: 'donor@mysuru.org' };
      }
      if (p.fullName.includes('Suresh')) {
        return { ...p, fullName: 'Patient Representative (Seeker)' };
      }
      return p;
    });
  }
  saveProfile(p: UserProfile): void {
    const list = this.getProfiles().filter((item) => item.id !== p.id);
    this.set('profiles', [p, ...list]);
  }
  getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }
  getProfileByEmail(email: string): UserProfile | undefined {
    return this.getProfiles().find(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );
  }

  // DONOR PROFILES
  getDonorProfiles(): DonorProfile[] {
    const donors = this.get<DonorProfile[]>('donor_profiles', INITIAL_DONORS);
    const profiles = this.getProfiles();
    return donors.map((d) => ({
      ...d,
      user: profiles.find((p) => p.id === d.userId),
    }));
  }
  saveDonorProfile(d: DonorProfile): void {
    const list = this.getDonorProfiles().filter((item) => item.id !== d.id);
    this.set('donor_profiles', [d, ...list]);
  }
  getDonorProfileByUserId(userId: string): DonorProfile | undefined {
    return this.getDonorProfiles().find((d) => d.userId === userId);
  }
  getDonorProfileById(id: string): DonorProfile | undefined {
    return this.getDonorProfiles().find((d) => d.id === id);
  }

  // BLOOD REQUESTS
  getBloodRequests(): BloodRequest[] {
    const requests = this.get<BloodRequest[]>('blood_requests', INITIAL_REQUESTS);
    const profiles = this.getProfiles();
    return requests.map((r) => ({
      ...r,
      requester: profiles.find((p) => p.id === r.requesterId),
    }));
  }
  saveBloodRequest(r: BloodRequest): void {
    const list = this.getBloodRequests().filter((item) => item.id !== r.id);
    this.set('blood_requests', [r, ...list]);
  }
  getBloodRequestById(id: string): BloodRequest | undefined {
    return this.getBloodRequests().find((r) => r.id === id);
  }

  // DONOR RESPONSES
  getDonorResponses(): DonorResponse[] {
    const responses = this.get<DonorResponse[]>('donor_responses', INITIAL_RESPONSES);
    const donors = this.getDonorProfiles();
    const requests = this.getBloodRequests();
    return responses.map((res) => ({
      ...res,
      donor: donors.find((d) => d.id === res.donorId),
      request: requests.find((r) => r.id === res.requestId),
    }));
  }
  saveDonorResponse(res: DonorResponse): void {
    const list = this.getDonorResponses().filter((item) => item.id !== res.id);
    this.set('donor_responses', [res, ...list]);
  }
  getResponsesForRequest(requestId: string): DonorResponse[] {
    return this.getDonorResponses().filter((r) => r.requestId === requestId);
  }
  getResponsesForDonor(donorId: string): DonorResponse[] {
    return this.getDonorResponses().filter((r) => r.donorId === donorId);
  }

  // HOSPITALS
  getHospitals(): Hospital[] {
    return this.get<Hospital[]>('hospitals', INITIAL_VERIFIED_HOSPITALS);
  }
  saveHospital(h: Hospital): void {
    const list = this.getHospitals().filter((item) => item.id !== h.id);
    this.set('hospitals', [h, ...list]);
  }

  // NOTIFICATIONS
  getNotifications(userId: string): NotificationItem[] {
    const list = this.get<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    return list.filter((n) => n.userId === userId);
  }
  addNotification(n: NotificationItem): void {
    const list = this.get<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    this.set('notifications', [n, ...list]);
  }
  markNotificationAsRead(id: string): void {
    const list = this.get<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS);
    this.set(
      'notifications',
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  // AUDIT LOGS
  getAuditLogs(): AuditLogItem[] {
    return this.get<AuditLogItem[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }
  addAuditLog(log: AuditLogItem): void {
    const list = this.getAuditLogs();
    this.set('audit_logs', [log, ...list]);
  }

  // RESET
  resetToDefaults(): void {
    localStorage.removeItem('bloodconnect_profiles');
    localStorage.removeItem('bloodconnect_donor_profiles');
    localStorage.removeItem('bloodconnect_blood_requests');
    localStorage.removeItem('bloodconnect_donor_responses');
    localStorage.removeItem('bloodconnect_hospitals');
    localStorage.removeItem('bloodconnect_notifications');
    localStorage.removeItem('bloodconnect_audit_logs');
  }
}

export const localStore = new LocalDataStore();
