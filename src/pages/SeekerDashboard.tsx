import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  MapPin,
  Clock,
  Heart,
  Droplet,
  AlertTriangle,
  Building2,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { BloodRequest, RequestStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface SeekerDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-800">Please Sign In</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blood-600 text-white rounded-lg text-xs font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const allRequests = localStore.getBloodRequests();
  const userRequests = allRequests.filter((r) => r.requesterId === currentUser.id);

  const activeRequests = userRequests.filter(
    (r) => r.status !== 'Fulfilled' && r.status !== 'Cancelled' && r.status !== 'Expired'
  );

  const pastRequests = userRequests.filter(
    (r) => r.status === 'Fulfilled' || r.status === 'Cancelled' || r.status === 'Expired'
  );

  const handleCancelRequest = (requestId: string) => {
    const req = localStore.getBloodRequestById(requestId);
    if (!req) return;

    if (confirm('Are you sure you want to cancel this blood request?')) {
      localStore.saveBloodRequest({
        ...req,
        status: 'Cancelled',
        updatedAt: new Date().toISOString(),
      });

      localStore.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: 'REQUEST_CANCELLED',
        entityType: 'BLOOD_REQUESTS',
        entityId: requestId,
        createdAt: new Date().toISOString(),
      });

      setSuccessMsg('Blood request cancelled.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleMarkFulfilled = (requestId: string) => {
    const req = localStore.getBloodRequestById(requestId);
    if (!req) return;

    localStore.saveBloodRequest({
      ...req,
      status: 'Fulfilled',
      updatedAt: new Date().toISOString(),
    });

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: 'REQUEST_MARKED_FULFILLED',
      entityType: 'BLOOD_REQUESTS',
      entityId: requestId,
      createdAt: new Date().toISOString(),
    });

    setSuccessMsg('Blood request marked as Fulfilled! Thank you.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blood-50 text-blood-800 border border-blood-200 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-blood-600" />
            <span>Mysuru Blood Seeker Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Welcome, {currentUser.fullName}
          </h1>
          <p className="text-xs text-neutral-500">
            Publish and manage blood requests for patients admitted to hospitals across Mysuru district.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create_request')}
          className="inline-flex items-center gap-2 px-5 py-3 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blood-600/20 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Blood Request</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-neutral-900">{activeRequests.length}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Active Requests</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-blood-600">{userRequests.length}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Total Created</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-emerald-600">
            {userRequests.filter((r) => r.status === 'Fulfilled').length}
          </p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Fulfilled</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-neutral-700">
            {
              userRequests
                .map((r) => localStore.getResponsesForRequest(r.id))
                .flat()
                .filter((res) => res.responseStatus === 'Accepted').length
            }
          </p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Donor Acceptances</p>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Active Requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Active Blood Requests</h2>
            <p className="text-xs text-neutral-500">
              Live requests currently being matched with voluntary donors in Mysuru.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create_request')}
            className="text-xs font-bold text-blood-600 hover:text-blood-800"
          >
            + Create Another
          </button>
        </div>

        {activeRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center space-y-3">
            <Droplet className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="font-bold text-neutral-800 text-sm">No Active Blood Requests</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              If a patient requires blood at a Mysuru hospital, create a new request to begin matching potential donors.
            </p>
            <button
              onClick={() => onNavigate('create_request')}
              className="px-4 py-2 bg-blood-600 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Create Request Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRequests.map((req) => {
              const responses = localStore.getResponsesForRequest(req.id);
              const accepted = responses.filter((r) => r.responseStatus === 'Accepted');
              const declined = responses.filter((r) => r.responseStatus === 'Declined');

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border-2 border-neutral-200 p-5 space-y-4 shadow-xs hover:border-neutral-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-blood-700">
                          {req.patientBloodGroup}
                        </span>
                        <span className="text-xs font-bold text-neutral-800">
                          ({req.unitsRequired} Units Required)
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
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Patient Name:</span>
                      <span className="font-semibold">{req.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Needed By:</span>
                      <span className="font-semibold">
                        {new Date(req.requiredAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Hospital Desk Contact:</span>
                      <span className="font-semibold">{req.hospitalContactNumber}</span>
                    </div>

                    {/* Responses progress indicator */}
                    <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {accepted.length} Accepted
                      </span>
                      <span className="text-neutral-500">
                        {declined.length} Declined
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => onNavigate('find_donors', { requestId: req.id })}
                      className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-blood-400" />
                      Find / Match Donors
                    </button>
                    <button
                      onClick={() => onNavigate('request_details', { requestId: req.id })}
                      className="py-2 px-3 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Track Status
                    </button>
                    <button
                      onClick={() => handleMarkFulfilled(req.id)}
                      className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition cursor-pointer"
                      title="Mark request fulfilled"
                    >
                      ✓ Mark Fulfilled
                    </button>
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition cursor-pointer"
                      title="Cancel Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request History */}
      {pastRequests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-neutral-900">Request History</h2>
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                  <th className="py-3 px-4">Hospital / Patient</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {pastRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-neutral-800">{r.hospitalName}</span>
                      <span className="text-[10px] text-neutral-400 block font-mono">
                        {r.patientName} • ID: {r.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blood-700">{r.patientBloodGroup}</td>
                    <td className="py-3 px-4 font-medium">{r.unitsRequired}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-neutral-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('request_details', { requestId: r.id })}
                        className="text-blood-600 font-bold hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
