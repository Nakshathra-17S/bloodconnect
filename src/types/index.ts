export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'donor' | 'blood_seeker' | 'administrator';

export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export type AvailabilityStatus = 'Available' | 'Temporarily Unavailable' | 'Unavailable';

export type UrgencyLevel = 'Normal' | 'Urgent' | 'Emergency';

export type RequestStatus =
  | 'Pending'
  | 'Matching Donors'
  | 'Requests Sent'
  | 'Partially Fulfilled'
  | 'Fulfilled'
  | 'Cancelled'
  | 'Expired';

export type ResponseStatus = 'Pending' | 'Accepted' | 'Declined';

export type HospitalVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  dateOfBirth: string;
  bloodGroup: BloodGroup;
  address: string;
  locality: string;
  latitude: number;
  longitude: number;
  availability: AvailabilityStatus;
  lastDonationDate?: string;
  consentToReceiveRequests: boolean;
  consentToShareContact: boolean;
  createdAt: string;
  updatedAt: string;
  // joined fields for display
  user?: UserProfile;
}

export interface BloodRequest {
  id: string;
  requesterId: string;
  patientName: string;
  patientBloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: UrgencyLevel;
  hospitalName: string;
  hospitalAddress: string;
  locality: string;
  latitude: number;
  longitude: number;
  hospitalContactNumber: string;
  requiredAt: string;
  additionalInformation?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  // joined fields
  requester?: UserProfile;
}

export interface DonorResponse {
  id: string;
  requestId: string;
  donorId: string; // donor_profiles.id
  responseStatus: ResponseStatus;
  contactSharingConsent: boolean;
  respondedAt?: string;
  createdAt: string;
  donor?: DonorProfile;
  request?: BloodRequest;
}

export interface Hospital {
  id: string;
  hospitalName: string;
  address: string;
  locality: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  verificationStatus: HospitalVerificationStatus;
  bloodBankAvailable: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: 'request' | 'response' | 'system' | 'verification' | 'consent';
  isRead: boolean;
  relatedRequestId?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}
