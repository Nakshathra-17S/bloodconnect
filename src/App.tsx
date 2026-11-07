import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { DistrictBanner } from './components/common/DistrictBanner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { DonorRegisterPage } from './pages/DonorRegisterPage';
import { SeekerRegisterPage } from './pages/SeekerRegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { SeekerDashboard } from './pages/SeekerDashboard';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { FindDonorsPage } from './pages/FindDonorsPage';
import { RequestTrackingPage } from './pages/RequestTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { DonorProfilePage } from './pages/DonorProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { HospitalManagementPage } from './pages/HospitalManagementPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ContactSupportPage } from './pages/ContactSupportPage';

// Quick Role switcher bar for reviewer convenience
import { ShieldCheck, Heart, Search, UserCheck } from 'lucide-react';

function AppContent() {
  const { currentUser, isAuthenticated, quickSwitchAccount } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  // Scroll to top on page navigation
  const handleNavigate = (page: string, params?: Record<string, string>) => {
    setCurrentPage(page);
    setPageParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected route enforcement
  useEffect(() => {
    if (currentPage === 'admin_dashboard' && currentUser?.role !== 'administrator') {
      setCurrentPage('login');
    }
  }, [currentPage, currentUser]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'donor_register':
        return <DonorRegisterPage onNavigate={handleNavigate} />;
      case 'seeker_register':
        return <SeekerRegisterPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'forgot_password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'donor_dashboard':
        return <DonorDashboard onNavigate={handleNavigate} />;
      case 'seeker_dashboard':
        return <SeekerDashboard onNavigate={handleNavigate} />;
      case 'create_request':
        return <CreateRequestPage onNavigate={handleNavigate} />;
      case 'find_donors':
        return <FindDonorsPage requestId={pageParams.requestId} onNavigate={handleNavigate} />;
      case 'request_details':
        return <RequestTrackingPage requestId={pageParams.requestId} onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'donor_profile':
        return <DonorProfilePage onNavigate={handleNavigate} />;
      case 'admin_dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />;
      case 'hospital_mgmt':
        return <HospitalManagementPage onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicyPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactSupportPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans">
      {/* 1. Mandatory Absolute District Banner */}
      <DistrictBanner />

      {/* 2. Top Navigation Bar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* 3. Reviewer Quick Account Switcher Toolbar */}
      <div className="bg-neutral-100 border-b border-neutral-200 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-neutral-600 font-semibold text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-blood-600" />
            <span>Active Session:</span>
            {isAuthenticated ? (
              <span className="font-bold text-neutral-900">
                {currentUser?.fullName} ({currentUser?.role.replace('_', ' ')})
              </span>
            ) : (
              <span className="italic text-neutral-500">Guest Visitor</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-neutral-500 font-medium hidden sm:inline">Demo Switch:</span>
            <button
              onClick={() => {
                quickSwitchAccount('user-seeker-1');
                handleNavigate('seeker_dashboard');
              }}
              className="px-2 py-0.5 rounded bg-white hover:bg-neutral-200 border border-neutral-300 font-medium text-neutral-700"
            >
              Seeker Demo
            </button>
            <button
              onClick={() => {
                quickSwitchAccount('user-donor-1');
                handleNavigate('donor_dashboard');
              }}
              className="px-2 py-0.5 rounded bg-white hover:bg-neutral-200 border border-blood-200 font-medium text-blood-700"
            >
              Donor Demo (O+)
            </button>
            <button
              onClick={() => {
                quickSwitchAccount('user-admin-1');
                handleNavigate('admin_dashboard');
              }}
              className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
            >
              Health Admin
            </button>
          </div>
        </div>
      </div>

      {/* 4. Page View Body */}
      <main className="flex-1">{renderCurrentPage()}</main>

      {/* 5. Comprehensive Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
