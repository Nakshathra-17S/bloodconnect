import React from 'react';
import {
  Heart,
  Droplet,
  Search,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  Building2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface LandingPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated, currentUser } = useAuth();

  const donors = localStore.getDonorProfiles();
  const requests = localStore.getBloodRequests();
  const hospitals = localStore.getHospitals();

  const activeDonorsCount = donors.filter(
    (d) => d.availability === 'Available' && d.consentToReceiveRequests
  ).length;
  const verifiedHospitalsCount = hospitals.filter(
    (h) => h.verificationStatus === 'Verified'
  ).length;
  const fulfilledRequestsCount = requests.filter((r) => r.status === 'Fulfilled').length;

  const handleBecomeDonor = () => {
    if (!isAuthenticated) {
      onNavigate('donor_register');
    } else if (currentUser?.role === 'donor') {
      onNavigate('donor_dashboard');
    } else {
      onNavigate('donor_register');
    }
  };

  const handleRequestBlood = () => {
    if (!isAuthenticated) {
      onNavigate('seeker_register');
    } else if (currentUser?.role === 'blood_seeker') {
      onNavigate('create_request');
    } else {
      onNavigate('seeker_register');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-neutral-200 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Prominent District Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold tracking-wide">
            <MapPin className="w-4 h-4 text-blood-600 animate-pulse" />
            <span>Serving Mysuru District, Karnataka Only</span>
          </div>

          {/* Mandatory Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-tight">
            Every Drop Counts.{' '}
            <span className="text-blood-600 block sm:inline">Every Connection Matters.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed">
            A location-restricted voluntary blood donor connection platform built exclusively for{' '}
            <strong>Mysuru district</strong>. Connecting voluntary donors, authorized seekers, and verified hospitals with zero commercialization and strict privacy safeguards.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={handleBecomeDonor}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blood-600 hover:bg-blood-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blood-600/20 transition cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Become a Voluntary Donor</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleRequestBlood}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-neutral-300 hover:border-neutral-400 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <Search className="w-4 h-4 text-blood-600" />
              <span>Request Blood for Patient</span>
            </button>
          </div>

          {/* District Boundary Alert Box */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blood-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-800">Geographical Rule Enforcement:</strong>{' '}
                Our server automatically verifies all coordinates against the official Mysuru district boundary polygon. Users, hospitals, and requests outside Mysuru district are rejected.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live District Platform Metrics (No fabricated data) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-neutral-900">{activeDonorsCount}</p>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
              Active Donors in Mysuru
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-blood-600">{requests.length}</p>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
              Total District Requests
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-emerald-600">{fulfilledRequestsCount}</p>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
              Fulfilled Requests
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 text-center shadow-xs">
            <p className="text-3xl font-extrabold text-neutral-900">{verifiedHospitalsCount}</p>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-1">
              Verified Mysuru Hospitals
            </p>
          </div>
        </div>
      </section>

      {/* Mandatory Clinical Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicalDisclaimer />
      </section>

      {/* How It Works (4 Step Flow) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blood-600 uppercase tracking-wider">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            How BloodConnect Coordinates in Mysuru
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            A secure protocol designed to connect willing donors while upholding complete medical privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold text-base border border-blood-200">
              1
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Request Submitted</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Blood seeker specifies the patient's blood group and a verified hospital within Mysuru district.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold text-base border border-blood-200">
              2
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Geospatial & ABO Match</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              System identifies compatible, available donors situated within Mysuru district using point-in-polygon verification.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold text-base border border-blood-200">
              3
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Explicit Donor Consent</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Eligible donors receive alerts and choose to accept or decline. Phone numbers remain completely shielded.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold text-base border border-blood-200">
              4
            </div>
            <h3 className="font-bold text-neutral-900 text-base">Hospital Crossmatch</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Upon mutual consent, contact sharing is enabled so the donor can proceed to the Mysuru hospital for clinical crossmatching.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits for Donors and Seekers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Donor Box */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blood-50 text-blood-600 flex items-center justify-center border border-blood-200">
              <Heart className="w-6 h-6 fill-blood-600" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Voluntary Donor Protection</h3>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Public Phone Display:</strong> Your phone number is never shown publicly or in search results.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Full Availability Control:</strong> Toggle your status to "Unavailable" or withdraw request consent at any time.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>District-Local Alerts:</strong> Receive only alerts for hospitals within Mysuru district (e.g. K.R. Hospital, Apollo, JSS).</span>
              </li>
            </ul>
            <button
              onClick={() => onNavigate('donor_register')}
              className="text-xs font-bold text-blood-600 hover:text-blood-800 inline-flex items-center gap-1 pt-2"
            >
              Register as Donor <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seeker Box */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-300">
              <Search className="w-6 h-6 text-neutral-800" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">Patient & Seeker Reliability</h3>
            <ul className="space-y-2.5 text-xs text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Accurate Preliminary Match:</strong> Direct ABO/Rh compatibility filtering without spamming unqualified donors.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Live Response Tracking:</strong> Real-time status updates as donors accept or decline your hospital request.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Verified Hospitals:</strong> Select from pre-verified Mysuru blood banks or pin authorized healthcare facilities.</span>
              </li>
            </ul>
            <button
              onClick={() => onNavigate('seeker_register')}
              className="text-xs font-bold text-neutral-900 hover:text-neutral-700 inline-flex items-center gap-1 pt-2"
            >
              Register as Blood Seeker <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Privacy & Safety Guarantee */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 border border-neutral-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-blood-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Privacy & Anti-Abuse Architecture</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                Protecting voluntary donors against unwanted spam and harassment
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                BloodConnect never exposes direct contact details without affirmative consent. Every action is recorded in immutable audit logs. Out-of-district and suspicious requests are intercepted and flagged for administrator review.
              </p>
            </div>
            <button
              onClick={() => onNavigate('privacy')}
              className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold border border-neutral-700 transition shrink-0"
            >
              Read Privacy Policy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
