import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const ContactSupportPage: React.FC<{ onNavigate: (page: string) => void }> = ({
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-50 border border-blood-200 text-blood-900 text-xs font-bold">
          <Phone className="w-3.5 h-3.5 text-blood-600" />
          <span>Mysuru District Support & Emergency Helpdesk</span>
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Contact & District Support
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600">
          For technical issues, verification requests, or emergency hospital helpline coordination within Mysuru district.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
              Emergency Blood Banks
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blood-50/70 border border-blood-200 space-y-1">
                <p className="font-bold text-blood-950">K.R. Hospital Blood Bank</p>
                <p className="text-neutral-600">Irwin Road, Sayyaji Rao Rd, Mysuru</p>
                <p className="text-blood-800 font-extrabold text-sm">0821-2520512</p>
                <span className="text-[10px] text-neutral-500 block">24x7 Government Facility</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1">
                <p className="font-bold text-neutral-900">Indian Red Cross Mysuru</p>
                <p className="text-neutral-600">Agrahara, Mysuru</p>
                <p className="text-neutral-900 font-extrabold text-sm">0821-2567433</p>
                <span className="text-[10px] text-neutral-500 block">Blood Storage & Donation</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 uppercase tracking-wider">
              Platform Support Desk
            </h3>
            <p className="text-neutral-600">
              Email: <strong>support@bloodconnect-mysuru.org</strong>
            </p>
            <p className="text-neutral-600">
              Office: District Health Office, Nazarbad, Mysuru, Karnataka 570010
            </p>
            <p className="text-neutral-500 text-[11px] pt-1 border-t border-neutral-200">
              Hours: Monday to Saturday, 9:00 AM – 6:00 PM (Emergency helpline 24/7).
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Send an Inquiry or Issue Report
            </h3>

            {submitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-950">Inquiry Dispatched</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you, <strong>{name}</strong>. Your inquiry has been logged in our district support queue. A representative will contact you at <strong>{email}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mahesh B."
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mahesh@example.com"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98450 XXXXX"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm bg-white"
                    >
                      <option value="General Support">General Platform Support</option>
                      <option value="Hospital Verification">Hospital / Blood Bank Verification</option>
                      <option value="Boundary / Geo Issue">Mysuru Location Verification Issue</option>
                      <option value="Privacy Concern">Privacy or Data Inquiries</option>
                      <option value="Report Suspicious">Report Suspicious or Commercial Activity</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Message Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry, hospital details, or issue..."
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl text-sm focus:ring-2 focus:ring-blood-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl shadow-xs text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to District Support Queue</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
