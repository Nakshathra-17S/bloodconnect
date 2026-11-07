import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, DonorProfile, UserRole } from '../types';
import { localStore } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: UserProfile | null;
  donorProfile: DonorProfile | null;
  isAuthenticated: boolean;
  isSupabaseMode: boolean;
  login: (email: string, targetRole?: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  registerUser: (
    fullName: string,
    email: string,
    phone: string,
    role: UserRole
  ) => Promise<UserProfile>;
  updateDonorProfile: (updates: Partial<DonorProfile>) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  refreshUserData: () => void;
  quickSwitchAccount: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bloodconnect_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bloodconnect_active_user');
      if (saved) {
        const u: UserProfile = JSON.parse(saved);
        if (u.role === 'donor') {
          return localStore.getDonorProfileByUserId(u.id) || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const refreshUserData = () => {
    if (!currentUser) return;
    const latestUser = localStore.getProfileById(currentUser.id);
    if (latestUser) {
      setCurrentUser(latestUser);
      localStorage.setItem('bloodconnect_active_user', JSON.stringify(latestUser));
      if (latestUser.role === 'donor') {
        const d = localStore.getDonorProfileByUserId(latestUser.id);
        setDonorProfile(d || null);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bloodconnect_active_user', JSON.stringify(currentUser));
      if (currentUser.role === 'donor') {
        const d = localStore.getDonorProfileByUserId(currentUser.id);
        setDonorProfile(d || null);
      } else {
        setDonorProfile(null);
      }
    } else {
      localStorage.removeItem('bloodconnect_active_user');
      setDonorProfile(null);
    }
  }, [currentUser]);

  const login = async (
    email: string,
    targetRole?: UserRole
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmed = email.trim().toLowerCase();
    const profile = localStore.getProfileByEmail(trimmed);

    if (!profile) {
      return {
        success: false,
        message: 'No account registered with this email address in Mysuru district.',
      };
    }

    if (profile.accountStatus !== 'active') {
      return {
        success: false,
        message: 'This account has been suspended or deactivated. Contact District Health Administrator.',
      };
    }

    // Role check if specific gateway was selected
    if (targetRole && profile.role !== targetRole) {
      if (profile.role !== 'administrator') {
        return {
          success: false,
          message: `Access denied. Your account is registered as ${profile.role.replace('_', ' ')}. Please select the correct portal.`,
        };
      }
    }

    setCurrentUser(profile);
    if (profile.role === 'donor') {
      const d = localStore.getDonorProfileByUserId(profile.id);
      setDonorProfile(d || null);
    }

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: profile.id,
      actorName: profile.fullName,
      action: 'USER_LOGIN_SUCCESS',
      entityType: 'AUTH',
      entityId: profile.id,
      details: { role: profile.role, email: profile.email },
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      localStore.addAuditLog({
        id: `audit-${Date.now()}`,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        action: 'USER_LOGOUT',
        entityType: 'AUTH',
        entityId: currentUser.id,
        createdAt: new Date().toISOString(),
      });
    }
    setCurrentUser(null);
    setDonorProfile(null);
    localStorage.removeItem('bloodconnect_active_user');
  };

  const registerUser = async (
    fullName: string,
    email: string,
    phone: string,
    role: UserRole
  ): Promise<UserProfile> => {
    const existing = localStore.getProfileByEmail(email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // Role safety: normal user cannot self-assign administrator role
    if (role === 'administrator') {
      throw new Error('Administrator privileges cannot be created through public registration.');
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStore.saveProfile(newUser);
    setCurrentUser(newUser);

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: newUser.id,
      actorName: newUser.fullName,
      action: 'USER_REGISTERED',
      entityType: 'PROFILES',
      entityId: newUser.id,
      details: { role: newUser.role, district: 'Mysuru' },
      createdAt: new Date().toISOString(),
    });

    return newUser;
  };

  const updateDonorProfile = (updates: Partial<DonorProfile>) => {
    if (!donorProfile) return;
    const updated: DonorProfile = {
      ...donorProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    localStore.saveDonorProfile(updated);
    setDonorProfile(updated);

    localStore.addAuditLog({
      id: `audit-${Date.now()}`,
      actorId: donorProfile.userId,
      actorName: currentUser?.fullName || 'Donor',
      action: 'DONOR_PROFILE_UPDATED',
      entityType: 'DONOR_PROFILES',
      entityId: donorProfile.id,
      details: updates,
      createdAt: new Date().toISOString(),
    });
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    // Disallow role tampering via update
    const { role, id, ...safeUpdates } = updates;
    const updated: UserProfile = {
      ...currentUser,
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    localStore.saveProfile(updated);
    setCurrentUser(updated);
  };

  const quickSwitchAccount = (userId: string) => {
    const target = localStore.getProfileById(userId);
    if (target) {
      setCurrentUser(target);
      if (target.role === 'donor') {
        setDonorProfile(localStore.getDonorProfileByUserId(target.id) || null);
      } else {
        setDonorProfile(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        donorProfile,
        isAuthenticated: !!currentUser,
        isSupabaseMode: isSupabaseConfigured,
        login,
        logout,
        registerUser,
        updateDonorProfile,
        updateUserProfile,
        refreshUserData,
        quickSwitchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
