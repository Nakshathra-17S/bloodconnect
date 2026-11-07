import React, { useState } from 'react';
import {
  Users,
  Search,
  MapPin,
  AlertCircle,
  Phone,
  Mail,
  Lock,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';

interface SeekerRegisterProps {
  onNavigate: (page: string) => void;
}

export const SeekerRegisterPage: React.FC<SeekerRegisterProps> = ({ onNavigate }) => {
  const { registerUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(fullName, email, phone, 'blood_seeker');
      onNavigate('seeker_dashboard');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto border border-neutral-300">
          <Users className="w-6 h-6 text-neutral-800" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold mb-2">
            <MapPin className="w-3.5 h-3.5 text-blood-600" />
            <span>Serving Mysuru District Only</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Register as Blood Seeker
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            For patients and authorized family members coordinating emergency blood requests in Mysuru district hospitals.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ananya Rao"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Contact Phone Number *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98450 12345"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ananya@example.com"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
            />
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs text-neutral-600">
            <strong>Geographical Restriction:</strong> All blood requests published must be linked to a hospital or medical clinic located within Mysuru district.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-sm text-sm transition cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Complete Seeker Registration'}
          </button>
        </form>

        <p className="text-xs text-neutral-500 pt-2">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-blood-600 font-bold hover:underline"
          >
            Sign In here
          </button>
        </p>
      </div>
    </div>
  );
};
