import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { CLINICAL_DISCLAIMER } from '../../utils/bloodCompatibility';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <span className="leading-tight">{CLINICAL_DISCLAIMER}</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-1.5 shadow-xs">
      <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <span>Mandatory Healthcare & Clinical Safety Notice</span>
      </div>
      <p className="leading-relaxed text-amber-900">
        BloodConnect is an informational coordination tool connecting voluntary donors with blood seekers in Mysuru district.
        <strong> It does not certify medical eligibility, does not make clinical decisions, and does not replace blood grouping, crossmatching, or standard blood bank screening.</strong>
      </p>
      <p className="font-semibold text-amber-950 bg-amber-100/70 p-2 rounded-lg border border-amber-200">
        "{CLINICAL_DISCLAIMER}"
      </p>
    </div>
  );
};
