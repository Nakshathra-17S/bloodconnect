import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Heart,
  Droplet,
  Info,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localStore } from '../lib/storage';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = () => {
    if (!currentUser) return;
    const list = localStore.getNotifications(currentUser.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const handleMarkAsRead = (id: string) => {
    localStore.markNotificationAsRead(id);
    loadNotifications();
  };

  const handleAction = (notif: NotificationItem) => {
    handleMarkAsRead(notif.id);
    if (notif.relatedRequestId) {
      if (currentUser?.role === 'donor') {
        onNavigate('donor_dashboard');
      } else {
        onNavigate('request_details', { requestId: notif.relatedRequestId });
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-800">Please Sign In</h2>
        <button
          onClick={() => onNavigate('login')}
          className="px-4 py-2 bg-blood-600 text-white rounded-lg text-xs font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blood-600" />
            <h1 className="text-2xl font-bold text-neutral-900">Notifications</h1>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
            {notifications.filter((n) => !n.isRead).length} Unread
          </span>
        </div>
        <p className="text-xs text-neutral-500">
          In-app notifications for blood requests, responses, and verification alerts in Mysuru district.
        </p>

        {/* External SMS / Push Integration Notice as required by prompt */}
        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <span>
            <strong>External Gateway Notice:</strong> SMS & WhatsApp gateways are currently unconfigured. BloodConnect operates high-priority in-app messaging within the active session.
          </span>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <Bell className="w-8 h-8 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-neutral-800 text-sm">No Notifications Yet</h3>
          <p className="text-xs text-neutral-500">
            You will receive updates here when requests are created, accepted, or verified.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition space-y-2 ${
                !n.isRead
                  ? 'border-blood-200 bg-blood-50/20 ring-1 ring-blood-500/10'
                  : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.notificationType === 'request'
                        ? 'bg-blood-100 text-blood-700'
                        : n.notificationType === 'response'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {n.notificationType === 'request' ? (
                      <Droplet className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900">{n.title}</h3>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blood-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-neutral-400 block pt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  {n.relatedRequestId && (
                    <button
                      onClick={() => handleAction(n)}
                      className="px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="text-xs text-neutral-500 hover:text-neutral-800 underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
