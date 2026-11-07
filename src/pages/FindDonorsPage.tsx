import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Heart,
  Droplet,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { BloodRequest, DonorProfile, DonorResponse } from '../types';
import {
  matchDonorsForRequest,
  MatchedDonorResult,
  getCompatibleDonorBloodGroups,
  CLINICAL_DISCLAIMER,
} from '../utils/bloodCompatibility';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface FindDonorsProps {
  requestId?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const FindDonorsPage: React.FC<FindDonorsProps> = ({ requestId, onNavigate }) => {
  const { currentUser } = useAuth();
  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [matchedResults, setMatchedResults] = useState<MatchedDonorResult[]>([]);
  const [sentDonorIds, setSentDonorIds] = useState<Set<string>>(new Set());
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;
    const req = localStore.getBloodRequestById(requestId);
    if (req) {
      setRequest(req);
      const allDonors = localStore.getDonorProfiles();
      try {
        const matches = matchDonorsForRequest(req, allDonors);
        setMatchedResults(matches);
      } catch (err) {
        console.error('Matching error:', err);
      }

      // Check which donors have already been sent this request
      const existingResponses = localStore.getResponsesForRequest(req.id);
      setSentDonorIds(new Set(existingResponses.map((r) => r.donorId)));
    }
  }, [requestId]);

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-blood-600 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-800">Blood Request Not Found</h2>
        <p className="text-xs text-neutral-500">
          No blood request found matching the specified identifier in Mysuru district.
        </p>
        <button
          onClick={() => onNavigate('seeker_dashboard')}
          className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const compatibleGroups = getCompatibleDonorBloodGroups(request.patientBloodGroup);

  const handleSendRequestToDonor = (donor: DonorProfile) => {
    // 1. Create or ensure donor_response record
    const existing = localStore
      .getResponsesForRequest(request.id)
      .find((r) => r.donorId === donor.id);

    if (!existing) {
      const responseRecord: DonorResponse = {
        id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requestId: request.id,
        donorId: donor.id,
        responseStatus: 'Pending',
        contactSharingConsent: false,
        createdAt: new Date().toISOString(),
      };
      localStore.saveDonorResponse(responseRecord);
    }

    // 2. Dispatch in-app notification to the voluntary donor
    localStore.addNotification({
      id: `notif-${Date.now()}`,
      userId: donor.userId,
      title: `Urgent Blood Match (${request.patientBloodGroup}) in Mysuru`,
      message: `${request.hospitalName} has an urgent request for ${request.unitsRequired} units of ${request.patientBloodGroup}. Can you help?`,
      notificationType: 'request',
      isRead: false,
      relatedRequestId: request.id,
      createdAt: new Date().toISOString(),
    });

    // 3. Update request status to 'Requests Sent'
    localStore.saveBloodRequest({
      ...request,
      status: 'Requests Sent',
      updatedAt: new Date().toISOString(),
    });

    // 4. Audit log entry
    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser?.id,
      actorName: currentUser?.fullName || 'Blood Seeker',
      action: 'REQUEST_SENT_TO_DONOR',
      entityType: 'BLOOD_REQUESTS',
      entityId: request.id,
      details: {
        donorId: donor.id,
        hospital: request.hospitalName,
        bloodGroup: donor.bloodGroup,
      },
      createdAt: new Date().toISOString(),
    });

    setSentDonorIds((prev) => new Set([...prev, donor.id]));
    setActionSuccessMsg(
      `Blood request dispatched to compatible donor (${donor.bloodGroup}) in ${donor.locality}!`
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleSendToAll = () => {
    matchedResults.forEach((res) => {
      if (!sentDonorIds.has(res.donor.id)) {
        handleSendRequestToDonor(res.donor);
      }
    });
    setActionSuccessMsg(`Dispatched requests to all ${matchedResults.length} compatible Mysuru donors.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('seeker_dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Seeker Dashboard
        </button>
      </div>

      {/* Request Header Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-blood-600" />
              <span>Mysuru District Donor Matching Engine</span>
            </div>
            <h1 className="text-2xl font-black text-neutral-900">
              Compatible Voluntary Donors in Mysuru
            </h1>
            <p className="text-xs text-neutral-600">
              For <strong>{request.patientName}</strong> • {request.hospitalName} ({request.locality})
            </p>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-right">
            <span className="text-[10px] uppercase font-bold text-neutral-500 block">
              Patient Blood Group
            </span>
            <span className="text-2xl font-black text-blood-700">
              {request.patientBloodGroup}
            </span>
            <span className="text-[11px] font-semibold text-neutral-600 block">
              {request.unitsRequired} Units Required
            </span>
          </div>
        </div>

        {/* Compatibility Reference Summary */}
        <div className="bg-blood-50/50 p-3 rounded-xl border border-blood-200 text-xs text-blood-950 flex flex-wrap items-center gap-2">
          <span className="font-bold">Compatible Donor Groups:</span>
          <div className="flex gap-1">
            {compatibleGroups.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded font-extrabold bg-white text-blood-800 border border-blood-200 text-xs"
              >
                {g}
              </span>
            ))}
          </div>
          <span className="text-neutral-500 text-[11px] ml-auto">
            (Calculated per ABO/Rh matrix)
          </span>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {actionSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Donors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Eligible Donors in Mysuru ({matchedResults.length})
            </h2>
            <p className="text-xs text-neutral-500">
              Filtered strictly by: Mysuru district perimeter, availability status, affirmative consent, and ABO/Rh match.
            </p>
          </div>

          {matchedResults.length > 0 && (
            <button
              onClick={handleSendToAll}
              className="py-2 px-3.5 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Send to All Matches
            </button>
          )}
        </div>

        {matchedResults.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
            <Users className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-neutral-800 text-sm">
              No Available Donors Matched Currently
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              No active donors in Mysuru district currently match the blood compatibility criteria ({compatibleGroups.join(', ')}) with active status and consent. The request remains live on the district board.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedResults.map(({ donor, distanceKm }) => {
              const hasSent = sentDonorIds.has(donor.id);
              const responses = localStore.getResponsesForRequest(request.id);
              const donorResponse = responses.find((r) => r.donorId === donor.id);

              return (
                <div
                  key={donor.id}
                  className="bg-white rounded-2xl border-2 border-neutral-200 p-5 space-y-4 shadow-xs hover:border-neutral-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-blood-700">
                          {donor.bloodGroup}
                        </span>
                        <span className="text-xs font-bold text-neutral-800">
                          {donor.user?.fullName || 'Registered Donor'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        <span>{donor.locality}</span>
                        <span>•</span>
                        <span className="font-semibold text-neutral-700">
                          ~{distanceKm} km away
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Inside Mysuru
                      </span>
                    </div>
                  </div>

                  {/* Privacy Card */}
                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <Lock className="w-3 h-3 text-neutral-400" />
                      <span>Phone Number & Exact Address: <strong>Hidden (Protected)</strong></span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-normal">
                      Contact details are unlocked only after this donor accepts the request and consents to coordinate.
                    </p>
                  </div>

                  {/* Action status */}
                  <div className="pt-1 flex items-center justify-between">
                    {donorResponse ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                            donorResponse.responseStatus === 'Accepted'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : donorResponse.responseStatus === 'Declined'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          Status: {donorResponse.responseStatus}
                        </span>
                        {donorResponse.responseStatus === 'Accepted' && (
                          <button
                            onClick={() =>
                              onNavigate('request_details', { requestId: request.id })
                            }
                            className="text-xs font-bold text-blood-600 hover:underline"
                          >
                            View Contact Details →
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendRequestToDonor(donor)}
                        className="w-full py-2.5 px-3 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Request to This Donor
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
