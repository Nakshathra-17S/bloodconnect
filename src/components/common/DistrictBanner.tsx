import React from 'react';
import { MapPin, ShieldAlert } from 'lucide-react';

export const DistrictBanner: React.FC = () => {
  return (
    <div className="bg-blood-900 text-white text-xs font-medium px-4 py-2 border-b border-blood-950 flex flex-wrap items-center justify-center gap-2 tracking-wide">
      <div className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-blood-200">
        <MapPin className="w-3.5 h-3.5 text-blood-300 animate-pulse" />
        <span>Serving Mysuru District, Karnataka Only</span>
      </div>
      <span className="hidden sm:inline text-blood-400">•</span>
      <span className="text-blood-100 text-[11px]">
        Strict geospatial point-in-polygon enforcement active. Out-of-district registrations and requests are rejected.
      </span>
    </div>
  );
};
