import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  MapPin,
  AlertCircle,
  CheckCircle,
  Calendar,
  Phone,
  User,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import {
  MYSURU_CENTER,
  MYSURU_TALUKS,
  validateMysuruLocation,
  MYSURU_RESTRICTION_MESSAGE,
} from '../services/geoService';
import { BloodGroup, AvailabilityStatus, DonorProfile } from '../types';
import { localStore } from '../lib/storage';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface DonorRegisterProps {
  onNavigate: (page: string) => void;
}

export const DonorRegisterPage: React.FC<DonorRegisterProps> = ({ onNavigate }) => {
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [locality, setLocality] = useState<string>(MYSURU_TALUKS[0]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number>(MYSURU_CENTER[0]);
  const [lng, setLng] = useState<number>(MYSURU_CENTER[1]);
  const [isLocationValid, setIsLocationValid] = useState<boolean>(true);
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [consentReceive, setConsentReceive] = useState(true);
  const [consentShare, setConsentShare] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Mandatory Geospatial Point-In-Polygon Validation
    const geo = validateMysuruLocation(lat, lng);
    if (!geo.isValid) {
      setErrorMsg(MYSURU_RESTRICTION_MESSAGE);
      return;
    }

    // 2. Validate Phone
    const phoneClean = phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      setErrorMsg('Please provide a valid 10-digit Indian phone number.');
      return;
    }

    // 3. Validate Age (18 - 65)
    if (!dob) {
      setErrorMsg('Date of birth is required.');
      return;
    }
    const birthDate = new Date(dob);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18 || age > 65) {
      setErrorMsg('Donors must be between 18 and 65 years of age according to medical guidelines.');
      return;
    }

    // 4. Mandatory Consent
    if (!consentReceive) {
      setErrorMsg('You must provide affirmative consent to receive voluntary blood requests in Mysuru.');
      return;
    }

    if (!address.trim()) {
      setErrorMsg('Residential address/locality is required.');
      return;
    }

    setSubmitting(true);

    try {
      // Create user account
      const user = await registerUser(fullName, email, phone, 'donor');

      // Create donor profile with strict Mysuru coordinates
      const newDonorProfile: DonorProfile = {
        id: `donor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        dateOfBirth: dob,
        bloodGroup,
        address: address.trim(),
        locality,
        latitude: lat,
        longitude: lng,
        availability,
        lastDonationDate: lastDonationDate || undefined,
        consentToReceiveRequests: consentReceive,
        consentToShareContact: consentShare,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localStore.saveDonorProfile(newDonorProfile);

      // Audit log entry
      localStore.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: user.id,
        actorName: user.fullName,
        action: 'DONOR_REGISTERED_MYSURU',
        entityType: 'DONOR_PROFILES',
        entityId: newDonorProfile.id,
        details: {
          bloodGroup,
          locality,
          coordinates: [lat, lng],
          districtVerified: true,
        },
        createdAt: new Date().toISOString(),
      });

      onNavigate('donor_dashboard');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-blood-600" />
          <span>Mysuru District Voluntary Donor Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
          Register as a Voluntary Blood Donor
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          Your personal contact details and residential address remain strictly confidential. Other users cannot see your phone number until you actively accept a specific hospital request.
        </p>

        {/* Notice on district restriction */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blood-600 shrink-0" />
          <span>
            <strong>Serving Mysuru District Only:</strong> Registrations outside Mysuru district are automatically rejected by system policy.
          </span>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-xs font-semibold text-red-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2">
          1. Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name as per official ID"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Confidential Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 12345"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Never displayed publicly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="donor@domain.com"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Date of Birth * (Age 18–65)
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Blood Group *
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold text-blood-700 bg-white focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2 pt-2">
          2. Mysuru District Locality & Residential Location
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Mysuru Taluk / Area *
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              {MYSURU_TALUKS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Residential Area / Street *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Kuvempunagar 4th Block"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Interactive Location Picker Map */}
        <div>
          <LocationPickerMap
            initialLat={lat}
            initialLng={lng}
            onLocationSelect={(newLat, newLng, valid) => {
              setLat(newLat);
              setLng(newLng);
              setIsLocationValid(valid);
            }}
            label="Pin General Residential Vicinity on Mysuru Map (Required)"
          />
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2 pt-2">
          3. Availability & Clinical History
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Initial Availability Status
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              <option value="Available">Available to Donate</option>
              <option value="Temporarily Unavailable">Temporarily Unavailable</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Last Donation Date (Optional)
            </label>
            <input
              type="date"
              value={lastDonationDate}
              onChange={(e) => setLastDonationDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-neutral-500 mt-1">
              Note: This date does not certify medical eligibility. Eligibility is confirmed at the hospital.
            </p>
          </div>
        </div>

        {/* Explicit Consent Checkboxes */}
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={consentReceive}
              onChange={(e) => setConsentReceive(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
            />
            <span className="text-xs text-neutral-700 leading-relaxed">
              <strong>Mandatory Consent:</strong> I voluntarily consent to receive incoming blood donation requests for patients admitted to hospitals in <strong>Mysuru District</strong>. I understand I can toggle my availability or withdraw this consent at any time.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentShare}
              onChange={(e) => setConsentShare(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
            />
            <span className="text-xs text-neutral-700 leading-relaxed">
              I authorize BloodConnect to share my phone number with verified hospital coordinators or blood seekers <strong>ONLY when I affirmatively accept</strong> a specific request.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting || !isLocationValid}
          className="w-full py-3.5 px-4 bg-blood-600 hover:bg-blood-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-blood-600/20 text-sm transition cursor-pointer flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>
            {submitting ? 'Verifying & Registering...' : 'Register as Mysuru Voluntary Donor'}
          </span>
        </button>
      </form>
    </div>
  );
};
