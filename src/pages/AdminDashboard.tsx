import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Droplet,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  MapPin,
  Lock,
  UserCheck,
  UserX,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { UserProfile, BloodRequest, Hospital, AuditLogItem } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'requests' | 'hospitals' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'administrator') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-blood-600 mx-auto" />
        <h2 className="text-2xl font-bold text-neutral-900">Administrator Access Prohibited</h2>
        <p className="text-xs text-neutral-600 max-w-md mx-auto">
          This portal is strictly restricted to authorized District Health Administrators in Mysuru. Security policies prohibit self-promotion to administrator.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blood-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In as Authorized Administrator
        </button>
      </div>
    );
  }

  const profiles = localStore.getProfiles();
  const donors = localStore.getDonorProfiles();
  const requests = localStore.getBloodRequests();
  const hospitals = localStore.getHospitals();
  const auditLogs = localStore.getAuditLogs();

  const totalUsers = profiles.length;
  const activeDonors = donors.filter(
    (d) => d.availability === 'Available' && d.consentToReceiveRequests
  ).length;
  const activeRequests = requests.filter(
    (r) => r.status !== 'Fulfilled' && r.status !== 'Cancelled' && r.status !== 'Expired'
  ).length;
  const fulfilledRequests = requests.filter((r) => r.status === 'Fulfilled').length;
  const pendingHospitals = hospitals.filter((h) => h.verificationStatus === 'Pending').length;

  const handleToggleUserStatus = (userId: string) => {
    const p = localStore.getProfileById(userId);
    if (!p) return;
    if (p.id === currentUser.id) {
      alert('You cannot suspend your own administrator account.');
      return;
    }

    const nextStatus = p.accountStatus === 'active' ? 'suspended' : 'active';
    localStore.saveProfile({
      ...p,
      accountStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    });

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: nextStatus === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      entityType: 'PROFILES',
      entityId: p.id,
      details: { email: p.email, role: p.role, nextStatus },
      createdAt: new Date().toISOString(),
    });

    setActionNotice(`User account ${p.fullName} set to: ${nextStatus}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleVerifyHospital = (hospitalId: string, newStatus: 'Verified' | 'Rejected') => {
    const h = hospitals.find((item) => item.id === hospitalId);
    if (!h) return;

    localStore.saveHospital({
      ...h,
      verificationStatus: newStatus,
    });

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      action: `HOSPITAL_${newStatus.toUpperCase()}`,
      entityType: 'HOSPITALS',
      entityId: h.id,
      details: { hospitalName: h.hospitalName, newStatus },
      createdAt: new Date().toISOString(),
    });

    setActionNotice(`Hospital ${h.hospitalName} is now marked as ${newStatus}.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blood-600" />
            <span>Mysuru District Administration Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            District Health Administrator Portal
          </h1>
          <p className="text-xs text-neutral-500">
            Authenticated administrator: <strong>{currentUser.fullName}</strong> ({currentUser.email})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('hospital_mgmt')}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            Manage Hospitals
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-neutral-900">{totalUsers}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Total Registered Users</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-blood-600">{activeDonors}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Active Willing Donors</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-amber-600">{activeRequests}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Active Blood Requests</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-emerald-600">{fulfilledRequests}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">Fulfilled Requests</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <p className="text-2xl font-black text-neutral-800">{hospitals.length}</p>
          <p className="text-xs font-semibold text-neutral-500 mt-1">District Facilities</p>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex items-center space-x-2 text-xs font-bold">
        {[
          { key: 'overview', label: 'District Overview' },
          { key: 'users', label: `Users & Donors (${profiles.length})` },
          { key: 'requests', label: `Blood Requests (${requests.length})` },
          { key: 'hospitals', label: `Hospitals (${hospitals.length})` },
          { key: 'audit', label: `Audit Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3 px-4 border-b-2 transition cursor-pointer ${
              activeTab === tab.key
                ? 'border-blood-600 text-blood-700 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mysuru Taluk Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Donors by Mysuru Taluk
                </h3>
                <span className="text-xs text-neutral-500">9 Taluks Regulated</span>
              </div>
              <div className="space-y-2">
                {[
                  'Mysuru City & Rural',
                  'Nanjangud',
                  'Hunsur',
                  'Tirumakudalu Narasipura (T. Narasipura)',
                  'Krishnarajanagara (K.R. Nagar)',
                  'Piriyapatna',
                  'Heggadadevanakote (H.D. Kote)',
                  'Sargur',
                  'Saligrama',
                ].map((taluk) => {
                  const count = donors.filter((d) => d.locality === taluk).length;
                  return (
                    <div key={taluk} className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-700 font-medium">{taluk}</span>
                      <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                        {count} Donors
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blood Group Availability Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Donor Blood Group Breakdown
                </h3>
                <span className="text-xs text-neutral-500">Mysuru District Registry</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
                  const count = donors.filter((d) => d.bloodGroup === bg).length;
                  const availableCount = donors.filter(
                    (d) => d.bloodGroup === bg && d.availability === 'Available'
                  ).length;
                  return (
                    <div
                      key={bg}
                      className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-base font-black text-blood-700">{bg}</span>
                        <p className="text-[10px] text-neutral-500">
                          {availableCount} Available
                        </p>
                      </div>
                      <span className="text-lg font-bold text-neutral-800">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & DONORS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">
                Registered District Users & Donors
              </h3>
              <span className="text-xs text-neutral-500">
                Total: {profiles.length} Accounts
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Locality / Taluk</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {profiles.map((p) => {
                    const d = donors.find((item) => item.userId === p.id);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <p className="font-bold text-neutral-900">{p.fullName}</p>
                          <p className="text-[10px] text-neutral-500">{p.email}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="capitalize font-semibold text-neutral-700">
                            {p.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {d ? (
                            <span className="font-extrabold text-blood-700 text-sm">
                              {d.bloodGroup}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-600">
                          {d?.locality || 'Mysuru District'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.accountStatus} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-right">
                          {p.role !== 'administrator' && (
                            <button
                              onClick={() => handleToggleUserStatus(p.id)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded transition ${
                                p.accountStatus === 'active'
                                  ? 'text-red-700 hover:bg-red-50 border border-red-200'
                                  : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                              }`}
                            >
                              {p.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BLOOD REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">
                All Mysuru District Blood Requests
              </h3>
              <span className="text-xs text-neutral-500">
                Total: {requests.length} Requests
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Patient & Hospital</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                        {r.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{r.hospitalName}</p>
                        <p className="text-[10px] text-neutral-500">{r.patientName} • {r.locality}</p>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-blood-700 text-sm">
                        {r.patientBloodGroup}
                      </td>
                      <td className="py-3 px-4 font-bold">{r.unitsRequired}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.urgency} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HOSPITALS */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="font-bold text-sm text-neutral-900">
                Hospital Verification Management (Mysuru District)
              </h3>
              <button
                onClick={() => onNavigate('hospital_mgmt')}
                className="text-xs font-bold text-blood-600 hover:underline"
              >
                Go to Hospital Directory →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                    <th className="py-3 px-4">Hospital Name</th>
                    <th className="py-3 px-4">Locality / Address</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {hospitals.map((h) => (
                    <tr key={h.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 font-bold text-neutral-900">{h.hospitalName}</td>
                      <td className="py-3 px-4 text-neutral-600">
                        {h.address}, {h.locality}
                      </td>
                      <td className="py-3 px-4 font-mono">{h.contactNumber}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={h.verificationStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {h.verificationStatus !== 'Verified' && (
                          <button
                            onClick={() => handleVerifyHospital(h.id, 'Verified')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded font-bold hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                        )}
                        {h.verificationStatus !== 'Rejected' && (
                          <button
                            onClick={() => handleVerifyHospital(h.id, 'Rejected')}
                            className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded font-bold hover:bg-red-100"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-bold text-sm text-neutral-900">
                Immutable System & Security Audit Logs
              </h3>
              <p className="text-[11px] text-neutral-500">
                Records of authentication, registration, requests, and consent actions across Mysuru district.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-700 font-bold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Entity Type</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 font-sans">
                        {log.actorName}
                      </td>
                      <td className="py-3 px-4 text-blood-700 font-bold">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-neutral-600">{log.entityType}</td>
                      <td className="py-3 px-4 text-neutral-500 font-sans text-[10px]">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
