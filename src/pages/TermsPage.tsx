import React from 'react';
import { FileText, MapPin, ShieldAlert, AlertTriangle } from 'lucide-react';
import { CLINICAL_DISCLAIMER } from '../utils/bloodCompatibility';

export const TermsPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <FileText className="w-3.5 h-3.5 text-blood-600" />
          <span>Platform Governance & Terms of Service</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Terms & Conditions of Service
        </h1>
        <p className="text-xs text-neutral-500">
          Operated Strictly for Mysuru District, Karnataka, India • Compliance Standards
        </p>
      </div>

      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>Statutory Medical Notice</span>
        </div>
        <p>"{CLINICAL_DISCLAIMER}"</p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs text-neutral-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            1. Absolute Geographical Restriction
          </h2>
          <p>
            BloodConnect is licensed and technically restricted exclusively to <strong>Mysuru District, Karnataka, India</strong>. Users, voluntary donors, and emergency blood requests outside the perimeter of Mysuru district cannot register or operate on this platform. Any attempt to provide fabricated coordinates will be rejected by our automated point-in-polygon verification engine.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            2. Strict Prohibition on Commercial Blood Transactions
          </h2>
          <p>
            Under the National Blood Transfusion Council (NBTC) regulations and the Drugs and Cosmetics Act of India, <strong>the purchase, sale, or commercial solicitation of human blood is illegal and strictly prohibited</strong>.
          </p>
          <p>
            Any user attempting to demand payment, offer monetary compensation, or broker blood donations will face immediate account termination and reporting to Mysuru district law enforcement authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            3. Disclaimer of Clinical Responsibility
          </h2>
          <p>
            BloodConnect operates solely as an informational coordination software. We do not certify medical fitness, do not conduct serological testing, and do not guarantee blood availability.
          </p>
          <p>
            Qualified healthcare staff at verified Mysuru hospitals or licensed blood banks must perform medical screening, hemoglobin estimation, infectious disease screening, and crossmatching prior to any transfusion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-200 pb-1">
            4. Limitation of Liability
          </h2>
          <p>
            The administrators and creators of BloodConnect shall not be held liable for delayed transfusions, clinical outcomes, or actions taken between users following authorized contact release. Users are advised to coordinate directly with certified hospital blood banks.
          </p>
        </section>
      </div>
    </div>
  );
};
