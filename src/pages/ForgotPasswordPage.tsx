import React, { useState } from 'react';
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Mail, MapPin } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-5 text-center">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto border border-neutral-300">
          <KeyRound className="w-6 h-6 text-neutral-800" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reset Your Password</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password Recovery Link Generated</span>
            </div>
            <p className="leading-relaxed">
              If an account with <strong>{email}</strong> exists within Mysuru district records, an authorized password reset email has been dispatched.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              ← Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
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

            <button
              type="submit"
              className="w-full py-3 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-sm text-sm transition cursor-pointer"
            >
              Send Password Recovery Link
            </button>
          </form>
        )}

        <div className="pt-3 border-t border-neutral-200">
          <button
            onClick={() => onNavigate('login')}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
