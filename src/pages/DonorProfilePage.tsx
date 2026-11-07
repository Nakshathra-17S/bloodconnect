import React, { useState } from 'react';
import {
  User,
  Heart,
  Droplet,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { LocationPickerMap } from '../components/map/LocationPickerMap';
import {
  MYSURU_TALUKS,
  validateMysuruLocation,
  MYSURU_RESTRICTION_MESSAGE,
} from '../services/geoService';
import { AvailabilityStatus, BloodGroup } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface DonorProfileProps {
  onNavigate: (page: string) => void;
}

export const DonorProfilePage: React.FC<DonorProfileProps> = ({ onNavigate }) => {
  const { currentUser, donorProfile, updateDonorProfile, updateUserProfile, logout } = useAuth();

  if (!currentUser || !donorProfile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-800">Donor Profile Unavailable</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blood-600 text-white rounded-lg text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [dob, setDob] = useState(donorProfile.dateOfBirth);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile.bloodGroup);
  const [locality, setLocality] = useState(donorProfile.locality);
  const [address, setAddress] = useState(donorProfile.address);
  const [availability, setAvailability] = useState<AvailabilityStatus>(donorProfile.availability);
  const [lastDonationDate, setLastDonationDate] = useState(donorProfile.lastDonationDate || '');
  const [consentReceive, setConsentReceive] = useState(donorProfile.consentToReceiveRequests);
  const [consentShare, setConsentShare] = useState(donorProfile.consentToShareContact);

  const [lat, setLat] = useState(donorProfile.latitude);
  const [lng, setLng] = useState(donorProfile.longitude);
  const [isLocationValid, setIsLocationValid] = useState(true);

  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(null);
    setErrorMsg(null);

    // Validate location strictly
    const geo = validateMysuruLocation(lat, lng);
    if (!geo.isValid) {
      setErrorMsg(MYSURU_RESTRICTION_MESSAGE);
      return;
    }

    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    updateUserProfile({ fullName, phone });
    updateDonorProfile({
      dateOfBirth: dob,
      bloodGroup,
      locality,
      address,
      latitude: lat,
      longitude: lng,
      availability,
      lastDonationDate: lastDonationDate || undefined,
      consentToReceiveRequests: consentReceive,
      consentToShareContact: consentShare,
    });

    setSavedMsg('Donor profile and Mysuru district location saved successfully.');
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blood-50 text-blood-700 flex items-center justify-center font-black text-xl border border-blood-200">
            {donorProfile.bloodGroup}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{currentUser.fullName}</h1>
            <p className="text-xs text-neutral-500">
              Registered Voluntary Donor • Mysuru District, Karnataka
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={donorProfile.availability} />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      <MedicalDisclaimer compact />

      {savedMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 text-xs font-bold text-red-900 flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2">
          Profile & Contact Settings
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Private Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Never shared without your explicit consent.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Email Address (Login)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3.5 py-2.5 border border-neutral-200 bg-neutral-100 text-neutral-500 rounded-xl text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Date of Birth
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
              Blood Group
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm font-bold text-blood-700 bg-white"
            >
              {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2 pt-2">
          Mysuru District Locality & Map Coordinates
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Mysuru Taluk
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white"
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
              Residential Street Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm"
            />
          </div>
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
            label="Update Coordinates on Mysuru Map (Strict District Boundary)"
          />
        </div>

        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 border-b border-neutral-200 pb-2 pt-2">
          Availability & Consent Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Current Donation Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white"
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
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentReceive}
              onChange={(e) => setConsentReceive(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
            />
            <span className="text-xs text-neutral-700 leading-relaxed">
              <strong>Consent to Receive Requests:</strong> Active consent to receive incoming blood donation alerts for hospitals within Mysuru district.
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentShare}
              onChange={(e) => setConsentShare(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-blood-600 focus:ring-blood-500"
            />
            <span className="text-xs text-neutral-700 leading-relaxed">
              Default authorization to reveal contact number automatically upon clicking Accept for emergency hospital crossmatches.
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!isLocationValid}
            className="flex-1 py-3 px-4 bg-blood-600 hover:bg-blood-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Availability</span>
          </button>
        </div>
      </form>
    </div>
  );
};
