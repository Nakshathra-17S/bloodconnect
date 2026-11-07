import React, { useState } from 'react';
import {
  LogIn,
  KeyRound,
  ShieldCheck,
  MapPin,
  AlertCircle,
  Heart,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('blood_seeker');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await login(email, role);
      if (res.success) {
        if (role === 'donor') {
          onNavigate('donor_dashboard');
        } else if (role === 'administrator') {
          onNavigate('admin_dashboard');
        } else {
          onNavigate('seeker_dashboard');
        }
      } else {
        setErrorMsg(res.message || 'Invalid login details.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail: string, demoRole: UserRole) => {
    setEmail(demoEmail);
    setRole(demoRole);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blood-50 text-blood-600 flex items-center justify-center mx-auto border border-blood-200">
          <LogIn className="w-6 h-6 text-blood-600" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-blood-600" />
            <span>Mysuru District Platform Access</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Sign In to BloodConnect</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Access your role-based dashboard for Mysuru district.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Portal Role Gateway
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white font-bold text-neutral-800 focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            >
              <option value="blood_seeker">Blood Seeker (Patient / Representative)</option>
              <option value="donor">Voluntary Blood Donor</option>
              <option value="administrator">District Health Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-neutral-500 text-[11px]">Protected district authentication</span>
            <button
              type="button"
              onClick={() => onNavigate('forgot_password')}
              className="text-blood-600 font-bold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-sm text-sm transition cursor-pointer"
          >
            {loading ? 'Authenticating...' : `Enter as ${role.replace('_', ' ')}`}
          </button>
        </form>

        {/* Quick Testing Demo Accounts */}
        <div className="pt-4 border-t border-neutral-200 text-left space-y-2">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">
            One-Click Demo Accounts (Mysuru Verified)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('seeker@mysuru.org', 'blood_seeker')}
              className="px-2 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-400 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-50 text-center"
            >
              Seeker Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('donor@mysuru.org', 'donor')}
              className="px-2 py-1.5 rounded-lg border border-blood-200 hover:border-blood-300 text-[11px] font-semibold text-blood-700 hover:bg-blood-50 text-center"
            >
              Donor Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('admin@bloodconnect.gov.in', 'administrator')}
              className="px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-[11px] font-bold text-center"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-3 flex items-center justify-around text-xs">
          <button
            onClick={() => onNavigate('donor_register')}
            className="text-neutral-600 hover:text-blood-600 font-medium"
          >
            New Donor? Register
          </button>
          <span className="text-neutral-300">•</span>
          <button
            onClick={() => onNavigate('seeker_register')}
            className="text-neutral-600 hover:text-neutral-900 font-medium"
          >
            New Seeker? Register
          </button>
        </div>
      </div>
    </div>
  );
};
