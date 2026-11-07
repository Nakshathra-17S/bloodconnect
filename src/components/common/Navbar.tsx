import React, { useState } from 'react';
import {
  Heart,
  Droplet,
  LogIn,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  User,
  PlusCircle,
  Building2,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { localStore } from '../../lib/storage';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = currentUser ? localStore.getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNav = (page: string, params?: Record<string, string>) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo & Name */}
          <div
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blood-600 flex items-center justify-center text-white shadow-md shadow-blood-600/30 group-hover:bg-blood-700 transition">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl tracking-tight text-neutral-900">
                  Blood<span className="text-blood-600">Connect</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blood-50 text-blood-800 border border-blood-200 px-1.5 py-0.5 rounded">
                  Mysuru
                </span>
              </div>
              <p className="text-[11px] font-medium text-neutral-500 mt-0.5">
                Mysuru District Voluntary Network
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNav('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === 'landing'
                  ? 'text-blood-700 bg-blood-50 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === 'about'
                  ? 'text-blood-700 bg-blood-50 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              About & Compatibility
            </button>
            <button
              onClick={() => handleNav('hospital_mgmt')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                currentPage === 'hospital_mgmt'
                  ? 'text-blood-700 bg-blood-50 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Verified Hospitals
            </button>

            {isAuthenticated && (
              <>
                {currentUser?.role === 'donor' && (
                  <button
                    onClick={() => handleNav('donor_dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === 'donor_dashboard'
                        ? 'text-blood-700 bg-blood-50 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    Donor Dashboard
                  </button>
                )}

                {currentUser?.role === 'blood_seeker' && (
                  <>
                    <button
                      onClick={() => handleNav('seeker_dashboard')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        currentPage === 'seeker_dashboard'
                          ? 'text-blood-700 bg-blood-50 font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      Seeker Dashboard
                    </button>
                    <button
                      onClick={() => handleNav('create_request')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Create Request
                    </button>
                  </>
                )}

                {currentUser?.role === 'administrator' && (
                  <button
                    onClick={() => handleNav('admin_dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                      currentPage === 'admin_dashboard'
                        ? 'text-blood-700 bg-blood-50 font-bold'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-blood-700" />
                    Admin Console
                  </button>
                )}

                {/* Notifications Bell */}
                <button
                  onClick={() => handleNav('notifications')}
                  title="Notifications"
                  className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-blood-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* User profile / Auth CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-2 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('donor_register')}
                  className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  Become a Donor
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pl-2 border-l border-neutral-200">
                <button
                  onClick={() =>
                    handleNav(
                      currentUser?.role === 'donor'
                        ? 'donor_profile'
                        : currentUser?.role === 'administrator'
                        ? 'admin_dashboard'
                        : 'seeker_dashboard'
                    )
                  }
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-neutral-100 transition text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blood-100 text-blood-800 flex items-center justify-center text-xs font-bold border border-blood-200">
                    {currentUser?.fullName.charAt(0) || 'U'}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-neutral-800">
                      {currentUser?.fullName}
                    </p>
                    <p className="text-[10px] text-neutral-500 capitalize">
                      {currentUser?.role.replace('_', ' ')}
                    </p>
                  </div>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-neutral-500 hover:text-blood-700 hover:bg-blood-50 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => handleNav('notifications')}
                className="relative p-2 text-neutral-600 hover:text-neutral-900"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-blood-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-2">
          <button
            onClick={() => handleNav('landing')}
            className="w-full text-left py-2 text-sm font-medium text-neutral-700 hover:text-blood-600"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('about')}
            className="w-full text-left py-2 text-sm font-medium text-neutral-700 hover:text-blood-600"
          >
            About & ABO/Rh Compatibility
          </button>
          <button
            onClick={() => handleNav('hospital_mgmt')}
            className="w-full text-left py-2 text-sm font-medium text-neutral-700 hover:text-blood-600"
          >
            Mysuru Verified Hospitals
          </button>

          {isAuthenticated ? (
            <>
              {currentUser?.role === 'donor' && (
                <>
                  <button
                    onClick={() => handleNav('donor_dashboard')}
                    className="w-full text-left py-2 text-sm font-semibold text-blood-700"
                  >
                    Donor Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('donor_profile')}
                    className="w-full text-left py-2 text-sm font-medium text-neutral-700"
                  >
                    Donor Profile & Privacy
                  </button>
                </>
              )}

              {currentUser?.role === 'blood_seeker' && (
                <>
                  <button
                    onClick={() => handleNav('seeker_dashboard')}
                    className="w-full text-left py-2 text-sm font-semibold text-blood-700"
                  >
                    Seeker Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('create_request')}
                    className="w-full text-left py-2 text-sm font-semibold text-blood-700"
                  >
                    + Create Blood Request
                  </button>
                </>
              )}

              {currentUser?.role === 'administrator' && (
                <button
                  onClick={() => handleNav('admin_dashboard')}
                  className="w-full text-left py-2 text-sm font-bold text-blood-800"
                >
                  Admin Console
                </button>
              )}

              <button
                onClick={() => handleNav('notifications')}
                className="w-full text-left py-2 text-sm font-medium text-neutral-700 flex justify-between"
              >
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-blood-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="pt-3 border-t border-neutral-200">
                <button
                  onClick={logout}
                  className="w-full text-left py-2 text-sm font-bold text-red-600 flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({currentUser?.fullName})
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 text-center text-sm font-semibold border border-neutral-300 rounded-lg text-neutral-800"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('donor_register')}
                className="w-full py-2.5 text-center text-sm font-semibold bg-blood-600 text-white rounded-lg shadow-sm"
              >
                Become a Voluntary Donor
              </button>
              <button
                onClick={() => handleNav('seeker_register')}
                className="w-full py-2.5 text-center text-sm font-semibold bg-neutral-900 text-white rounded-lg"
              >
                Request Blood for Patient
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
