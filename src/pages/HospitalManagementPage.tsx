import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Search,
  PlusCircle,
  ShieldCheck,
  Droplet,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { Hospital, HospitalVerificationStatus } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import {
  MYSURU_CENTER,
  MYSURU_TALUKS,
  validateMysuruLocation,
  MYSURU_RESTRICTION_MESSAGE,
} from '../services/geoService';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface HospitalManagementProps {
  onNavigate: (page: string) => void;
}

export const HospitalManagementPage: React.FC<HospitalManagementProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'administrator';

  const [hospitals, setHospitals] = useState<Hospital[]>(() => localStore.getHospitals());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaluk, setSelectedTaluk] = useState<string>('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // New hospital form state
  const [newHospName, setNewHospName] = useState('');
  const [newHospAddress, setNewHospAddress] = useState('');
  const [newHospLocality, setNewHospLocality] = useState<string>(MYSURU_TALUKS[0]);
  const [newHospPhone, setNewHospPhone] = useState('');
  const [hasBloodBank, setHasBloodBank] = useState(true);
  const [lat, setLat] = useState(MYSURU_CENTER[0]);
  const [lng, setLng] = useState(MYSURU_CENTER[1]);
  const [isLocationValid, setIsLocationValid] = useState(true);

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshHospitals = () => {
    setHospitals(localStore.getHospitals());
  };

  const filteredHospitals = hospitals.filter((h) => {
    // Non-admins see only verified
    if (!isAdmin && h.verificationStatus !== 'Verified') return false;

    const matchesQuery =
      h.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.locality.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTaluk = selectedTaluk === 'All' || h.locality === selectedTaluk;

    return matchesQuery && matchesTaluk;
  });

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Strict Mysuru location check
    const geo = validateMysuruLocation(lat, lng);
    if (!geo.isValid) {
      setFormError(MYSURU_RESTRICTION_MESSAGE);
      return;
    }

    if (!newHospName.trim() || !newHospAddress.trim()) {
      setFormError('Hospital name and address are required.');
      return;
    }

    const newHospital: Hospital = {
      id: `hosp-${Date.now()}`,
      hospitalName: newHospName.trim(),
      address: newHospAddress.trim(),
      locality: newHospLocality,
      latitude: lat,
      longitude: lng,
      contactNumber: newHospPhone.trim(),
      verificationStatus: isAdmin ? 'Verified' : 'Pending',
      bloodBankAvailable: hasBloodBank,
      createdAt: new Date().toISOString(),
    };

    localStore.saveHospital(newHospital);

    if (currentUser) {
      localStore.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: 'HOSPITAL_ADDED',
        entityType: 'HOSPITALS',
        entityId: newHospital.id,
        details: { hospital: newHospital.hospitalName, locality: newHospital.locality },
        createdAt: new Date().toISOString(),
      });
    }

    setSuccessMsg(
      isAdmin
        ? `Hospital ${newHospital.hospitalName} verified and added to directory.`
        : 'Hospital submitted for administrator verification.'
    );
    setShowAddForm(false);
    refreshHospitals();
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5 text-blood-600" />
            <span>Mysuru District Healthcare Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Verified Hospitals & Blood Banks
          </h1>
          <p className="text-xs text-neutral-500">
            Authoritative healthcare facilities operating within Mysuru District, Karnataka.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {showAddForm ? 'Close Form' : 'Register New Hospital'}
          </button>
        )}
      </div>

      <MedicalDisclaimer compact />

      {successMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Add Hospital Form */}
      {showAddForm && isAdmin && (
        <form
          onSubmit={handleCreateHospital}
          className="bg-white rounded-2xl border-2 border-blood-200 p-6 sm:p-8 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-base font-bold text-neutral-900">
              Register New Hospital / Blood Bank in Mysuru
            </h2>
            <span className="text-xs font-bold text-blood-600 uppercase">Admin Action</span>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Hospital / Blood Bank Name *
              </label>
              <input
                type="text"
                required
                value={newHospName}
                onChange={(e) => setNewHospName(e.target.value)}
                placeholder="e.g. Government General Hospital"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Mysuru Taluk *
              </label>
              <select
                value={newHospLocality}
                onChange={(e) => setNewHospLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white"
              >
                {MYSURU_TALUKS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Street / Detailed Address *
              </label>
              <input
                type="text"
                required
                value={newHospAddress}
                onChange={(e) => setNewHospAddress(e.target.value)}
                placeholder="Road, Landmark, Ward in Mysuru"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Emergency Contact / Blood Bank Phone *
              </label>
              <input
                type="tel"
                required
                value={newHospPhone}
                onChange={(e) => setNewHospPhone(e.target.value)}
                placeholder="+91 821 252 0512"
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
              <input
                type="checkbox"
                checked={hasBloodBank}
                onChange={(e) => setHasBloodBank(e.target.checked)}
                className="rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
              />
              <span>Licensed Blood Bank / Storage Center Available</span>
            </label>
          </div>

          <div>
            <LocationPickerMap
              initialLat={lat}
              initialLng={lng}
              onLocationSelect={(newLat, newLng, valid) => {
                setLat(newLat);
                setLng(newLng);
                setIsLocationValid(valid);
              }}
              label="Pin Hospital Coordinates within Mysuru District Boundary (Mandatory)"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!isLocationValid}
              className="px-5 py-2.5 bg-blood-600 hover:bg-blood-700 disabled:bg-neutral-300 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              Verify & Add Hospital
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, locality, or address in Mysuru..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-xl text-xs focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedTaluk}
            onChange={(e) => setSelectedTaluk(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white font-medium"
          >
            <option value="All">All Mysuru Taluks</option>
            {MYSURU_TALUKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHospitals.map((h) => (
          <div
            key={h.id}
            className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                  {h.locality}
                </span>
                <StatusBadge status={h.verificationStatus} size="sm" />
              </div>

              <h3 className="font-bold text-neutral-900 text-sm leading-snug">
                {h.hospitalName}
              </h3>

              <p className="text-xs text-neutral-500 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <span>{h.address}</span>
              </p>

              {h.bloodBankAvailable && (
                <div className="inline-flex items-center gap-1 text-[11px] text-blood-700 bg-blood-50 px-2 py-0.5 rounded border border-blood-200 font-semibold">
                  <Droplet className="w-3 h-3 fill-blood-600" />
                  <span>Licensed Blood Bank Onsite</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-mono text-neutral-600 font-bold">{h.contactNumber}</span>
              <a
                href={`tel:${h.contactNumber}`}
                className="px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>Call Desk</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
