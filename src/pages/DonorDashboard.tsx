import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  ShieldCheck,
  Bell,
  User,
  Check,
  X,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { BloodRequest, DonorResponse, AvailabilityStatus } from '../types';
import { isBloodCompatible, CLINICAL_DISCLAIMER } from '../utils/bloodCompatibility';
import { StatusBadge } from '../components/common/StatusBadge';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface DonorDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const DonorDashboard: React.FC<DonorDashboardProps> = ({ onNavigate }) => {
  const { currentUser, donorProfile, updateDonorProfile, refreshUserData } = useAuth();

  const [activeModalRequest, setActiveModalRequest] = useState<BloodRequest | null>(null);
  const [consentContactShare, setConsentContactShare] = useState<boolean>(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!currentUser || !donorProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blood-50 text-blood-600 flex items-center justify-center mx-auto">
          <Droplet className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Donor Profile Not Found</h2>
        <p className="text-xs text-neutral-500">
          You are signed in, but no donor profile was found for this user account.
        </p>
        <button
          onClick={() => onNavigate('donor_register')}
          className="px-4 py-2 bg-blood-600 text-white rounded-lg text-xs font-semibold"
        >
          Complete Donor Registration
        </button>
      </div>
    );
  }

  const allRequests = localStore.getBloodRequests();
  const allResponses = localStore.getResponsesForDonor(donorProfile.id);

  // Filter requests that are:
  // 1. Not cancelled or expired
  // 2. Compatible with this donor's blood group
  // 3. Haven't already been responded to by this donor
  const respondedRequestIds = new Set(allResponses.map((r) => r.requestId));

  const incomingCompatibleRequests = allRequests.filter((req) => {
    if (req.status === 'Cancelled' || req.status === 'Expired' || req.status === 'Fulfilled') {
      return false;
    }
    const compatible = isBloodCompatible(req.patientBloodGroup, donorProfile.bloodGroup);
    return compatible && !respondedRequestIds.has(req.id);
  });

  const handleAvailabilityChange = (newStatus: AvailabilityStatus) => {
    updateDonorProfile({ availability: newStatus });
    setActionSuccessMessage(`Availability status updated to: ${newStatus}`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleToggleConsent = () => {
    const nextConsent = !donorProfile.consentToReceiveRequests;
    updateDonorProfile({ consentToReceiveRequests: nextConsent });
    setActionSuccessMessage(
      nextConsent
        ? 'Consent to receive Mysuru blood requests enabled.'
        : 'Consent withdrawn. You will not receive new requests.'
    );
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleConfirmAccept = () => {
    if (!activeModalRequest) return;

    const newResponse: DonorResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId: activeModalRequest.id,
      donorId: donorProfile.id,
      responseStatus: 'Accepted',
      contactSharingConsent: consentContactShare,
      respondedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    localStore.saveDonorResponse(newResponse);

    // Notify the blood seeker
    localStore.addNotification({
      id: `notif-${Date.now()}`,
      userId: activeModalRequest.requesterId,
      title: 'Donor Accepted Your Request!',
      message: `${currentUser.fullName} (${donorProfile.bloodGroup}) accepted your request for ${activeModalRequest.hospitalName}. Contact sharing authorized: ${consentContactShare ? 'Yes' : 'No'}.`,
      notificationType: 'response',
      isRead: false,
      relatedRequestId: activeModalRequest.id,
      createdAt: new Date().toISOString(),
    });

    // Update request status to Requests Sent or Partially Fulfilled
    localStore.saveBloodRequest({
      ...activeModalRequest,
      status: 'Partially Fulfilled',
      updatedAt: new Date().toISOString(),
    });

    // Audit log
    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: 'DONOR_ACCEPTED_REQUEST',
      entityType: 'BLOOD_REQUESTS',
      entityId: activeModalRequest.id,
      details: {
        hospital: activeModalRequest.hospitalName,
        contactConsent: consentContactShare,
      },
      createdAt: new Date().toISOString(),
    });

    setActiveModalRequest(null);
    setActionSuccessMessage(
      'Thank you! You have accepted this request. The hospital seeker has been notified.'
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleDeclineRequest = (request: BloodRequest) => {
    const newResponse: DonorResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestId: request.id,
      donorId: donorProfile.id,
      responseStatus: 'Declined',
      contactSharingConsent: false,
      respondedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    localStore.saveDonorResponse(newResponse);

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: 'DONOR_DECLINED_REQUEST',
      entityType: 'BLOOD_REQUESTS',
      entityId: request.id,
      createdAt: new Date().toISOString(),
    });

    setActionSuccessMessage('Request declined. Your response has been recorded.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blood-50 text-blood-800 border border-blood-200 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-blood-600" />
            <span>Mysuru District Donor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs text-neutral-500 flex items-center gap-2">
            <span>Locality: <strong>{donorProfile.locality}</strong></span>
            <span>•</span>
            <span>Blood Group: <strong className="text-blood-700 text-sm">{donorProfile.bloodGroup}</strong></span>
          </p>
        </div>

        {/* Availability Toggle Box */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex flex-col gap-2 w-full md:w-auto">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Donation Availability
            </span>
            <StatusBadge status={donorProfile.availability} size="sm" />
          </div>
          <div className="inline-flex rounded-lg border border-neutral-300 p-0.5 bg-white">
            {(['Available', 'Temporarily Unavailable', 'Unavailable'] as AvailabilityStatus[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleAvailabilityChange(status)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    donorProfile.availability === status
                      ? 'bg-blood-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Profile Health / Consent Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Receiving Requests
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-neutral-800">
              {donorProfile.consentToReceiveRequests ? 'Active Consent' : 'Consent Withdrawn'}
            </span>
            <button
              onClick={handleToggleConsent}
              className={`text-xs px-2.5 py-1 rounded font-bold border transition ${
                donorProfile.consentToReceiveRequests
                  ? 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border-neutral-300'
                  : 'bg-blood-50 text-blood-700 border-blood-200'
              }`}
            >
              {donorProfile.consentToReceiveRequests ? 'Withdraw' : 'Enable'}
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Last Donation Recorded
          </span>
          <p className="text-sm font-bold text-neutral-800 pt-1">
            {donorProfile.lastDonationDate
              ? new Date(donorProfile.lastDonationDate).toLocaleDateString()
              : 'None recorded'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Privacy Status
          </span>
          <div className="flex items-center gap-1.5 pt-1 text-xs text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Phone & Address Hidden</span>
          </div>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Incoming Compatible Blood Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Incoming Compatible Blood Requests
            </h2>
            <p className="text-xs text-neutral-500">
              Verified hospital requests in Mysuru district matching your blood group ({donorProfile.bloodGroup}).
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blood-50 text-blood-700 border border-blood-200">
            {incomingCompatibleRequests.length} Available
          </span>
        </div>

        {incomingCompatibleRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-neutral-800">
              No Pending Compatible Blood Requests
            </p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              There are currently no urgent requests for {donorProfile.bloodGroup} in Mysuru district hospitals. Thank you for staying on standby!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingCompatibleRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border-2 border-neutral-200 p-5 space-y-4 shadow-xs hover:border-blood-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-blood-700">
                        {req.unitsRequired} Units • {req.patientBloodGroup}
                      </span>
                      <StatusBadge status={req.urgency} size="sm" />
                    </div>
                    <h3 className="font-bold text-neutral-900 text-sm mt-1">
                      {req.hospitalName}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-neutral-400" />
                      {req.locality}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      ID: {req.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Patient:</span>
                    <span className="font-semibold">{req.patientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Needed By:</span>
                    <span className="font-semibold">
                      {new Date(req.requiredAt).toLocaleString()}
                    </span>
                  </div>
                  {req.additionalInformation && (
                    <p className="text-[11px] text-neutral-700 pt-1 border-t border-neutral-200/60">
                      "{req.additionalInformation}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalRequest(req)}
                    className="flex-1 py-2 px-3 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Accept Request
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req)}
                    className="py-2 px-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response History Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Your Response History</h2>
          <p className="text-xs text-neutral-500">
            Records of previous blood requests you have evaluated in Mysuru district.
          </p>
        </div>

        {allResponses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-xs text-neutral-500">
            No previous responses recorded.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                    <th className="py-3 px-4">Hospital / Request</th>
                    <th className="py-3 px-4">Patient Blood Group</th>
                    <th className="py-3 px-4">Your Decision</th>
                    <th className="py-3 px-4">Contact Shared?</th>
                    <th className="py-3 px-4">Responded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {allResponses.map((res) => (
                    <tr key={res.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-800">
                          {res.request?.hospitalName || 'Mysuru District Hospital'}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          {res.requestId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-blood-700">
                        {res.request?.patientBloodGroup || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={res.responseStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.contactSharingConsent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {res.contactSharingConsent ? 'Authorized' : 'Protected'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {res.respondedAt
                          ? new Date(res.respondedAt).toLocaleString()
                          : new Date(res.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Acceptance & Contact Consent Modal */}
      {activeModalRequest && (
        <div className="fixed inset-0 z-50 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-blood-600 fill-blood-600" />
                <h3 className="font-bold text-neutral-900 text-base">Accept Blood Request</h3>
              </div>
              <button
                onClick={() => setActiveModalRequest(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-neutral-700">
              <p>
                You are agreeing to donate blood for <strong>{activeModalRequest.patientName}</strong> ({activeModalRequest.patientBloodGroup}) at:
              </p>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
                <p className="font-bold text-neutral-900">{activeModalRequest.hospitalName}</p>
                <p className="text-neutral-500">{activeModalRequest.hospitalAddress}</p>
                <p className="text-neutral-500">Hospital Desk: {activeModalRequest.hospitalContactNumber}</p>
              </div>
            </div>

            {/* Explicit Contact Sharing Consent */}
            <div className="bg-blood-50/70 border border-blood-200 rounded-xl p-3.5 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentContactShare}
                  onChange={(e) => setConsentContactShare(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
                />
                <span className="text-xs text-neutral-800 leading-normal">
                  <strong>Explicit Consent for Contact Sharing:</strong> I authorize BloodConnect to release my mobile number (<strong>{currentUser.phone}</strong>) to this patient's authorized representative solely for hospital donation coordination.
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModalRequest(null)}
                className="flex-1 py-2.5 px-3 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="flex-1 py-2.5 px-3 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
