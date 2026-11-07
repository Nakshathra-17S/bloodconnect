import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  PhoneCall,
  User,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { BloodRequest, DonorResponse, RequestStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface RequestTrackingProps {
  requestId?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const RequestTrackingPage: React.FC<RequestTrackingProps> = ({ requestId, onNavigate }) => {
  const { currentUser } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [responses, setResponses] = useState<DonorResponse[]>([]);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const loadData = () => {
    if (!requestId) return;
    const req = localStore.getBloodRequestById(requestId);
    if (req) {
      setRequest(req);
      const resList = localStore.getResponsesForRequest(req.id);
      setResponses(resList);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-blood-600 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-800">Request Not Found</h2>
        <button
          onClick={() => onNavigate('seeker_dashboard')}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleUpdateStatus = (newStatus: RequestStatus) => {
    localStore.saveBloodRequest({
      ...request,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser?.id,
      actorName: currentUser?.fullName || 'Requester',
      action: 'REQUEST_STATUS_UPDATED',
      entityType: 'BLOOD_REQUESTS',
      entityId: request.id,
      details: { oldStatus: request.status, newStatus },
      createdAt: new Date().toISOString(),
    });

    setUpdateMsg(`Request status updated to ${newStatus}`);
    loadData();
    setTimeout(() => setUpdateMsg(null), 3000);
  };

  const acceptedResponses = responses.filter((r) => r.responseStatus === 'Accepted');
  const declinedResponses = responses.filter((r) => r.responseStatus === 'Declined');
  const pendingResponses = responses.filter((r) => r.responseStatus === 'Pending');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('seeker_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {/* Main Request Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                ID: {request.id.slice(0, 10)}
              </span>
              <StatusBadge status={request.status} />
              <StatusBadge status={request.urgency} size="sm" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 pt-1">
              {request.unitsRequired} Units of {request.patientBloodGroup} for {request.patientName}
            </h1>
            <p className="text-xs text-neutral-500">
              Created on {new Date(request.createdAt).toLocaleString()} • Strictly inside Mysuru District
            </p>
          </div>

          <div className="flex items-center gap-2">
            {request.status !== 'Fulfilled' && request.status !== 'Cancelled' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('Fulfilled')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  ✓ Mark Fulfilled
                </button>
                <button
                  onClick={() => handleUpdateStatus('Cancelled')}
                  className="px-3.5 py-2 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel Request
                </button>
              </>
            )}
          </div>
        </div>

        {updateMsg && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{updateMsg}</span>
          </div>
        )}

        {/* Hospital & Clinical Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
              Hospital Details (Mysuru)
            </span>
            <p className="text-sm font-bold text-neutral-900">{request.hospitalName}</p>
            <p className="text-neutral-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {request.hospitalAddress}, {request.locality}
            </p>
            <p className="text-neutral-600 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              Hospital Desk: <strong>{request.hospitalContactNumber}</strong>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px] block">
              Schedule & Clinical Notes
            </span>
            <p className="text-neutral-700">
              Required by: <strong>{new Date(request.requiredAt).toLocaleString()}</strong>
            </p>
            {request.additionalInformation ? (
              <p className="text-neutral-600 italic">"{request.additionalInformation}"</p>
            ) : (
              <p className="text-neutral-400">No additional clinical notes specified.</p>
            )}
            <div className="pt-1">
              <button
                onClick={() => onNavigate('find_donors', { requestId: request.id })}
                className="text-xs font-bold text-blood-600 hover:underline"
              >
                + Find More Compatible Mysuru Donors →
              </button>
            </div>
          </div>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Responses Section with Privacy Controls */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Donor Responses ({responses.length})
          </h2>
          <p className="text-xs text-neutral-500">
            Contact numbers are unlocked only after affirmative donor acceptance and consent.
          </p>
        </div>

        {responses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
            <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="font-bold text-neutral-800 text-sm">No Donor Responses Yet</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You haven't dispatched this request to specific Mysuru donors yet, or donors are currently reviewing your request.
            </p>
            <button
              onClick={() => onNavigate('find_donors', { requestId: request.id })}
              className="px-4 py-2 bg-blood-600 text-white rounded-xl text-xs font-semibold"
            >
              Match & Dispatch to Donors
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((res) => {
              const isAcceptedWithConsent =
                res.responseStatus === 'Accepted' && res.contactSharingConsent;

              return (
                <div
                  key={res.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 ${
                    isAcceptedWithConsent
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-black text-blood-700 text-sm border border-neutral-300">
                        {res.donor?.bloodGroup || '—'}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900 text-sm">
                          {isAcceptedWithConsent
                            ? res.donor?.user?.fullName || 'Verified Donor'
                            : 'Voluntary Donor (Name & Contact Shielded)'}
                        </h3>
                        <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-neutral-400" />
                          <span>{res.donor?.locality || 'Mysuru District'}</span>
                          <span>•</span>
                          <span>
                            Responded:{' '}
                            {res.respondedAt
                              ? new Date(res.respondedAt).toLocaleTimeString()
                              : 'Pending'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={res.responseStatus} />
                  </div>

                  {/* Privacy / Contact Revelation Box */}
                  {isAcceptedWithConsent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <PhoneCall className="w-4 h-4 text-emerald-700" />
                        <span>Direct Coordination Authorized by Donor</span>
                      </div>
                      <p className="text-emerald-800">
                        The donor has explicitly accepted your request and authorized contact sharing:
                      </p>
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-neutral-500 font-semibold">Donor Phone Number:</p>
                          <p className="text-base font-extrabold text-neutral-900">
                            {res.donor?.user?.phone || '+91 98450 XXXXX'}
                          </p>
                        </div>
                        <a
                          href={`tel:${res.donor?.user?.phone}`}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition"
                        >
                          Call Donor for Hospital Arrival
                        </a>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Coordinate with the donor to arrive at {request.hospitalName} blood bank for mandatory clinical crossmatching.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>
                        {res.responseStatus === 'Declined'
                          ? 'Donor was unable to donate at this time. Contact details remain strictly protected.'
                          : 'Pending donor review. Contact details remain confidential until the donor affirmatively accepts.'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
