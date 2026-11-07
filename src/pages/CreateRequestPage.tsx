import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Phone,
  FileText,
  Heart,
  Droplet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { BloodGroup, UrgencyLevel, BloodRequest, Hospital } from '../types';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import {
  MYSURU_CENTER,
  MYSURU_TALUKS,
  validateMysuruLocation,
  MYSURU_RESTRICTION_MESSAGE,
} from '../services/geoService';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface CreateRequestProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CreateRequestPage: React.FC<CreateRequestProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [verifiedHospitals, setVerifiedHospitals] = useState<Hospital[]>([]);
  const [usePredefined, setUsePredefined] = useState(true);

  const [patientName, setPatientName] = useState('');
  const [patientBloodGroup, setPatientBloodGroup] = useState<BloodGroup>('O+');
  const [unitsRequired, setUnitsRequired] = useState(2);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Urgent');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [locality, setLocality] = useState<string>(MYSURU_TALUKS[0]);
  const [hospitalContact, setHospitalContact] = useState('');
  const [requiredAt, setRequiredAt] = useState(() => {
    const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [additionalInformation, setAdditionalInformation] = useState('');
  const [lat, setLat] = useState<number>(MYSURU_CENTER[0]);
  const [lng, setLng] = useState<number>(MYSURU_CENTER[1]);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const list = localStore.getHospitals().filter((h) => h.verificationStatus === 'Verified');
    setVerifiedHospitals(list);
    if (list.length > 0) {
      const def = list[0];
      setHospitalName(def.hospitalName);
      setHospitalAddress(def.address);
      setLocality(def.locality);
      setHospitalContact(def.contactNumber);
      setLat(def.latitude);
      setLng(def.longitude);
      setIsLocationValid(true);
    }
  }, []);

  const handleSelectHospital = (hospitalId: string) => {
    const h = verifiedHospitals.find((item) => item.id === hospitalId);
    if (h) {
      setHospitalName(h.hospitalName);
      setHospitalAddress(h.address);
      setLocality(h.locality);
      setHospitalContact(h.contactNumber);
      setLat(h.latitude);
      setLng(h.longitude);
      const res = validateMysuruLocation(h.latitude, h.longitude);
      setIsLocationValid(res.isValid);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentUser) {
      setErrorMsg('You must be signed in to submit a blood request.');
      return;
    }

    // 1. Authoritative Geospatial Validation (Strict Mysuru Rule)
    const geo = validateMysuruLocation(lat, lng);
    if (!geo.isValid) {
      setErrorMsg(MYSURU_RESTRICTION_MESSAGE);
      return;
    }

    if (!patientName.trim()) {
      setErrorMsg('Patient name is required.');
      return;
    }

    if (!hospitalName.trim() || !hospitalAddress.trim()) {
      setErrorMsg('Hospital name and address are required.');
      return;
    }

    if (!hospitalContact.trim()) {
      setErrorMsg('Hospital phone number or contact desk is required.');
      return;
    }

    setSubmitting(true);

    try {
      const newRequest: BloodRequest = {
        id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        requesterId: currentUser.id,
        patientName: patientName.trim(),
        patientBloodGroup,
        unitsRequired: Number(unitsRequired),
        urgency,
        hospitalName: hospitalName.trim(),
        hospitalAddress: hospitalAddress.trim(),
        locality,
        latitude: lat,
        longitude: lng,
        hospitalContactNumber: hospitalContact.trim(),
        requiredAt: new Date(requiredAt).toISOString(),
        additionalInformation: additionalInformation.trim() || undefined,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStore.saveBloodRequest(newRequest);

      // Audit log entry
      localStore.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: 'BLOOD_REQUEST_CREATED',
        entityType: 'BLOOD_REQUESTS',
        entityId: newRequest.id,
        details: {
          patientBloodGroup,
          unitsRequired,
          hospital: hospitalName,
          coordinates: [lat, lng],
          districtVerified: true,
        },
        createdAt: new Date().toISOString(),
      });

      // Automatically navigate to find/match potential Mysuru donors for this request
      onNavigate('find_donors', { requestId: newRequest.id });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to publish blood request.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-blood-600" />
          <span>Mysuru District Hospital Blood Request</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Create Patient Blood Request
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Requests are restricted strictly to hospitals and healthcare centers within{' '}
          <strong>Mysuru district</strong>. Once submitted, compatible voluntary donors in Mysuru will be notified.
        </p>
      </div>

      <MedicalDisclaimer compact />

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-xs font-bold text-red-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Request Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2">
          1. Patient Blood Requirement
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Patient Blood Group *
            </label>
            <select
              value={patientBloodGroup}
              onChange={(e) => setPatientBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-extrabold text-blood-700 bg-white focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Units Required * (1–10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={unitsRequired}
              onChange={(e) => setUnitsRequired(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Urgency Level *
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold bg-white focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency (Immediate)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Patient Full Name / IP Number *
            </label>
            <input
              type="text"
              required
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Basavaraju K. (ICU Ward 2)"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Required Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={requiredAt}
              onChange={(e) => setRequiredAt(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2 pt-2">
          2. Hospital in Mysuru District
        </h2>

        {/* Predefined verified hospitals vs custom */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Hospital Selector
            </span>
            <button
              type="button"
              onClick={() => setUsePredefined(!usePredefined)}
              className="text-xs font-bold text-blood-600 hover:underline"
            >
              {usePredefined
                ? 'Or Enter Other Clinic in Mysuru'
                : 'Select from Verified Mysuru Hospitals'}
            </button>
          </div>

          {usePredefined ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Verified Mysuru Hospital / Blood Bank
              </label>
              <select
                onChange={(e) => handleSelectHospital(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white font-medium"
              >
                {verifiedHospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hospitalName} ({h.locality})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  placeholder="e.g. Subbaiah Clinic, Nanjangud"
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Locality / Taluk *
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white"
                >
                  {MYSURU_TALUKS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Detailed Hospital Address *
              </label>
              <input
                type="text"
                required
                value={hospitalAddress}
                onChange={(e) => setHospitalAddress(e.target.value)}
                placeholder="Floor, Wing, Street address in Mysuru"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Hospital Desk / Blood Bank Phone *
              </label>
              <input
                type="tel"
                required
                value={hospitalContact}
                onChange={(e) => setHospitalContact(e.target.value)}
                placeholder="e.g. 0821-2520512 or mobile"
                className="w-full px-3.5 py-2 border border-neutral-300 rounded-xl text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Location Picker Map */}
        <div>
          <LocationPickerMap
            initialLat={lat}
            initialLng={lng}
            onLocationSelect={(newLat, newLng, valid) => {
              setLat(newLat);
              setLng(newLng);
              setIsLocationValid(valid);
            }}
            label="Verify Hospital Coordinates inside Mysuru District Boundary (Mandatory)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Additional Notes for Donors (Optional)
          </label>
          <textarea
            rows={2}
            value={additionalInformation}
            onChange={(e) => setAdditionalInformation(e.target.value)}
            placeholder="e.g. Replacement blood for emergency bypass surgery tomorrow at 8:00 AM. Crossmatch kit ready."
            className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isLocationValid}
          className="w-full py-3.5 px-4 bg-blood-600 hover:bg-blood-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-blood-600/20 text-sm transition cursor-pointer flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>
            {submitting ? 'Validating & Publishing...' : 'Submit Request & Match Mysuru Donors'}
          </span>
        </button>
      </form>
    </div>
  );
};
