import React from 'react';
import { Droplet, Phone, ShieldCheck, MapPin, Heart, FileText, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Mission & District Scope */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blood-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Blood<span className="text-blood-500">Connect</span>
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              A location-restricted voluntary blood donor connection platform engineered exclusively for <strong>Mysuru District, Karnataka</strong>. Connecting willing donors with verified hospital blood requests while safeguarding donor privacy.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-800 text-blood-400 border border-neutral-700 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blood-500" />
              <span>Mysuru District Only</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition text-neutral-400"
                >
                  About & ABO/Rh Compatibility
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('donor_register')}
                  className="hover:text-white transition text-neutral-400"
                >
                  Become a Voluntary Donor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('seeker_register')}
                  className="hover:text-white transition text-neutral-400"
                >
                  Request Blood for Patient
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hospital_mgmt')}
                  className="hover:text-white transition text-neutral-400"
                >
                  Mysuru Verified Hospitals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-white transition text-neutral-400"
                >
                  Sign In / Role Gateway
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Governance & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-white transition text-neutral-400 flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-blood-500" />
                  Privacy Policy & Contact Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-white transition text-neutral-400 flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-blood-500" />
                  Terms & Boundary Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition text-neutral-400"
                >
                  District Help & Support Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines in Mysuru */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              District Helplines (Mysuru)
            </h4>
            <p className="text-[11px] text-neutral-400 mb-2.5">
              For immediate clinical emergencies or crossmatching at government facilities:
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/60 p-2 rounded border border-neutral-700/60">
                <Phone className="w-3.5 h-3.5 text-blood-500 shrink-0" />
                <span>K.R. Hospital Blood Bank: <strong>0821-2520512</strong></span>
              </div>
              <div className="flex items-center gap-2 text-neutral-300 bg-neutral-800/60 p-2 rounded border border-neutral-700/60">
                <Phone className="w-3.5 h-3.5 text-blood-500 shrink-0" />
                <span>Red Cross Mysuru: <strong>0821-2567433</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="border-t border-neutral-800 pt-6 text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} BloodConnect Mysuru. Serving Mysuru District, Karnataka Only.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            Medical Crossmatch Required by Law • Built for <Heart className="w-3 h-3 text-blood-500 fill-blood-500 inline" /> Mysuru District
          </p>
        </div>
      </div>
    </footer>
  );
};
