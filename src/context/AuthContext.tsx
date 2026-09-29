import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  getUserProfile,
  logOut,
  signIn,
  signInGoogle,
  signUp,
  subscribeToAuth,
  syncUserProfile,
  updateUserProfile,
  DEFAULT_USER_PROFILE,
  ANURAG_USER_ID,
  ANURAG_PROFILE
} from '../services/authService';
import { UserProfile } from '../types';

const defaultAnuragUser = {
  uid: ANURAG_USER_ID,
  email: '13anurag07@gmail.com',
  displayName: 'Anurag',
  photoURL: '',
} as unknown as User;

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(defaultAnuragUser);
  const [profile, setProfile] = useState<UserProfile | null>(ANURAG_PROFILE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch / sync of Anurag profile in Firestore
    const initProfile = async () => {
      try {
        const existing = await getUserProfile(ANURAG_USER_ID);
        if (existing) {
          setProfile({
            ...existing,
            displayName: 'Anurag',
            whatsappNumber: existing.whatsappNumber?.includes('98765') ? '+91 8767377234' : (existing.whatsappNumber || '+91 8767377234'),
          });
        } else {
          await updateUserProfile(ANURAG_USER_ID, ANURAG_PROFILE);
          setProfile(ANURAG_PROFILE);
        }
      } catch (err) {
        console.warn('Initial profile sync note:', err);
      }
    };
    initProfile();

    const unsubscribe = subscribeToAuth(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const prof = await syncUserProfile(user);
          setProfile({
            ...prof,
            displayName: 'Anurag',
            whatsappNumber: prof.whatsappNumber?.includes('98765') ? '+91 8767377234' : (prof.whatsappNumber || '+91 8767377234'),
          });
        } catch (e) {
          console.error('Failed to sync profile', e);
        }
      } else {
        // Fallback always to Anurag (no auth wall)
        setCurrentUser(defaultAnuragUser);
        setProfile(ANURAG_PROFILE);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const cred = await signIn(email, pass);
    const prof = await syncUserProfile(cred.user);
    setProfile(prof);
  };

  const register = async (email: string, pass: string, name: string) => {
    const cred = await signUp(email, pass, name);
    const prof = await syncUserProfile(cred.user);
    setProfile(prof);
  };

  const loginWithGoogle = async () => {
    const cred = await signInGoogle();
    const prof = await syncUserProfile(cred.user);
    setProfile(prof);
  };

  const logout = async () => {
    try {
      await logOut();
    } catch {
      // ignore
    }
    // Always keep active as Anurag since authentication is removed
    setCurrentUser(defaultAnuragUser);
    setProfile(ANURAG_PROFILE);
  };

  const refreshProfile = async () => {
    const uid = currentUser?.uid || ANURAG_USER_ID;
    const p = await getUserProfile(uid);
    if (p) setProfile(p);
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    const uid = currentUser?.uid || ANURAG_USER_ID;
    await updateUserProfile(uid, {
      ...updates,
      displayName: 'Anurag',
    });
    setProfile((prev) => (prev ? { ...prev, ...updates, displayName: 'Anurag' } : { ...ANURAG_PROFILE, ...updates }));
  };

  const loginAsGuest = () => {
    setCurrentUser(defaultAnuragUser);
    setProfile(ANURAG_PROFILE);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshProfile,
        updateProfileData,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
