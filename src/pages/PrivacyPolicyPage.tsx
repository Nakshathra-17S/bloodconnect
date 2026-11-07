import React from 'react';
import { ShieldCheck, Lock, MapPin, EyeOff, UserCheck, AlertCircle } from 'lucide-react';

export const PrivacyPolicyPage: React.FC<{ onNavigate: (page: string) => void }> = ({
  onNavigate,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <Lock className="w-3.5 h-3.5 text-blood-600" />
          <span>Donor Privacy & Personal Data Protection Framework</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Privacy Policy & Contact Protection
        </h1>
        <p className="text-xs text-neutral-500">
          Last Updated: November 2026 • Mandatory Compliance for Mysuru District, Karnataka
        </p>
      </div>

      {/* Core Privacy Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">No Public Directory</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Donor mobile numbers and exact residential street addresses are never indexed, crawled, or publicly viewable.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">Two-Party Consent</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Contact information is unlocked exclusively after a donor reviews an emergency request and explicitly grants authorization.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blood-50 text-blood-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-neutral-900 text-sm">Geographical Boundary</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All data remains quarantined within Mysuru district. Coordinates outside this perimeter are rejected at the database level.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs text-neutral-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            1. Data We Collect and Store
          </h2>
          <p>
            When registering on BloodConnect in Mysuru District, we collect voluntary information necessary to match donors with verified hospital needs:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Personal Identification:</strong> Full legal name, date of birth, and email address.</li>
            <li><strong>Blood Characteristics:</strong> ABO/Rh blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).</li>
            <li><strong>Geospatial Data:</strong> Taluk locality in Mysuru and latitude/longitude coordinates strictly validated inside the Mysuru district boundary.</li>
            <li><strong>Availability & Consent:</strong> Availability status, history of previous donation dates, and consent states.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            2. Anti-Commercialization and Zero Sales Policy
          </h2>
          <p>
            BloodConnect is a strictly voluntary, non-commercial public healthcare utility for Mysuru district. We never sell, rent, monetize, or lease donor records, patient requests, or medical details to private advertisers, insurance companies, or third-party marketing entities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            3. Row Level Security & Access Control
          </h2>
          <p>
            Our PostgreSQL database employs strict Row Level Security (RLS) policies:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Donors can only read and modify their own donor profile.</li>
            <li>Blood seekers cannot query full donor phone numbers directly from database tables.</li>
            <li>Audit logs record all logins, status changes, and consent events.</li>
            <li>Admin privileges are strictly provisioned server-side and cannot be assigned via frontend manipulation.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            4. Right to Withdraw Consent & Deletion
          </h2>
          <p>
            Any voluntary donor may toggle their availability to "Unavailable" or withdraw request consent immediately via their dashboard. To permanently delete your profile, contact the District Health Administrator.
          </p>
        </section>
      </div>
    </div>
  );
};
