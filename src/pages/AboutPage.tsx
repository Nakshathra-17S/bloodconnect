import React from 'react';
import {
  ShieldAlert,
  Droplet,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  Building,
} from 'lucide-react';
import {
  COMPATIBILITY_MATRIX,
  CLINICAL_DISCLAIMER,
  CLINICAL_NOTICE_FULL,
} from '../utils/bloodCompatibility';
import { MYSURU_TALUKS } from '../services/geoService';
import { BloodGroup } from '../types';

export const AboutPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <MapPin className="w-3.5 h-3.5 text-blood-600" />
          <span>Serving Mysuru District, Karnataka Only</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          About BloodConnect & Red-Cell Compatibility
        </h1>
        <p className="text-sm text-neutral-600 max-w-3xl leading-relaxed">
          BloodConnect was created specifically to eliminate delays in emergency blood access across <strong>Mysuru district</strong>, while enforcing strict privacy protections and absolute geographical constraints.
        </p>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Statutory Healthcare & Crossmatching Notice</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
          {CLINICAL_NOTICE_FULL}
        </p>
        <p className="text-xs text-amber-950 font-bold bg-amber-100 p-2.5 rounded-lg border border-amber-200">
          "{CLINICAL_DISCLAIMER}"
        </p>
      </div>

      {/* ABO / Rh Red-Cell Compatibility Reference Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Preliminary ABO/Rh Red-Cell Compatibility Matrix
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            This reference is used strictly as a preliminary filter to identify potentially compatible voluntary donors. Final verification and crossmatching are performed exclusively by hospital pathology laboratories.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-neutral-200 shadow-xs bg-white">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-800 font-bold">
                <th className="py-3.5 px-4 sm:px-6">Patient Blood Group</th>
                <th className="py-3.5 px-4 sm:px-6">Potential Compatible Donor Blood Groups</th>
                <th className="py-3.5 px-4 sm:px-6 text-neutral-600">Red-Cell Suitability Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-medium">
              {bloodGroups.map((group) => {
                const compatibleDonors = COMPATIBILITY_MATRIX[group];
                return (
                  <tr key={group} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3 px-4 sm:px-6 font-bold text-blood-700 text-base">
                      {group}
                    </td>
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {compatibleDonors.map((dg) => (
                          <span
                            key={dg}
                            className="inline-block px-2.5 py-0.5 rounded-md font-bold bg-blood-50 text-blood-800 border border-blood-200 text-xs"
                          >
                            {dg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-xs text-neutral-500">
                      {group === 'AB+' && 'Universal Recipient for Red Blood Cells'}
                      {group === 'O-' && 'Universal Donor for Red Blood Cells'}
                      {group !== 'AB+' && group !== 'O-' && 'Standard ABO/Rh Isohemagglutinin Match'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absolute Geographical Scope */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blood-600" />
          <h2 className="text-xl font-bold text-neutral-900">
            Absolute Geographical Scope — Mysuru District Only
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
          BloodConnect is legally and architecturally bound to <strong>Mysuru district</strong>. The platform utilizes server-side Ray-Casting point-in-polygon validation to verify coordinates on every registration and request. Any coordinates or IP locations outside this perimeter are rejected automatically.
        </p>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Covered Taluks in Mysuru District
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {MYSURU_TALUKS.map((taluk) => (
              <div
                key={taluk}
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 font-medium"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{taluk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety & Privacy Governance */}
      <div className="bg-neutral-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold">Privacy Architecture & Anti-Abuse Standards</h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          BloodConnect never publishes donor phone numbers or exact residential street addresses. All matches are processed internally, and contact sharing is only released with two-party affirmative consent after a hospital blood request is actively accepted by the donor.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => onNavigate('privacy')}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold border border-neutral-700 transition"
          >
            Review Privacy Policy
          </button>
          <button
            onClick={() => onNavigate('hospital_mgmt')}
            className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-xs font-semibold transition"
          >
            View Verified Hospitals
          </button>
        </div>
      </div>
    </div>
  );
};
