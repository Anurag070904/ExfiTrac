import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { UserProfile } from '../types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_TASK_CATEGORIES } from '../utils/constants';

export const DEFAULT_USER_PROFILE = (user: User): UserProfile => ({
  uid: user.uid,
  email: user.email || '13anurag07@gmail.com',
  displayName: user.displayName || 'Anurag',
  photoURL: user.photoURL || '',
  whatsappNumber: '+91 8767377234',
  currency: '₹',
  currencyCode: 'INR',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  monthlyIncome: 65000,
  monthlySavingsTarget: 20000,
  theme: 'system',
  whatsappNotifications: {
    enabled: true,
    morningBriefing: true,
    morningTime: '07:00',
    eveningReview: true,
    eveningTime: '20:00',
    expenseReminder: true,
    weeklyReport: true,
    monthlyReport: true,
  },
  customTaskCategories: [...DEFAULT_TASK_CATEGORIES],
  customExpenseCategories: [...DEFAULT_EXPENSE_CATEGORIES],
  defaultPaymentMethod: 'UPI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const ANURAG_USER_ID = 'anurag';

export const ANURAG_PROFILE: UserProfile = {
  uid: ANURAG_USER_ID,
  email: '13anurag07@gmail.com',
  displayName: 'Anurag',
  photoURL: '',
  whatsappNumber: '+91 8767377234',
  currency: '₹',
  currencyCode: 'INR',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  monthlyIncome: 65000,
  monthlySavingsTarget: 20000,
  theme: 'system',
  whatsappNotifications: {
    enabled: true,
    morningBriefing: true,
    morningTime: '07:00',
    eveningReview: true,
    eveningTime: '20:00',
    expenseReminder: true,
    weeklyReport: true,
    monthlyReport: true,
  },
  customTaskCategories: [...DEFAULT_TASK_CATEGORIES],
  customExpenseCategories: [...DEFAULT_EXPENSE_CATEGORIES],
  defaultPaymentMethod: 'UPI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      // Guarantee name is Anurag and phone is 8767377234
      return {
        ...data,
        displayName: 'Anurag',
        whatsappNumber: data.whatsappNumber?.includes('98765') ? '+91 8767377234' : (data.whatsappNumber || '+91 8767377234'),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);
  if (!snap.exists()) {
    const defaultProfile = DEFAULT_USER_PROFILE(user);
    await setDoc(userDocRef, defaultProfile);
    return defaultProfile;
  }
  const data = snap.data() as UserProfile;
  return {
    ...data,
    displayName: 'Anurag',
    whatsappNumber: data.whatsappNumber?.includes('98765') ? '+91 8767377234' : (data.whatsappNumber || '+91 8767377234'),
  };
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  await setDoc(
    userDocRef,
    {
      ...updates,
      displayName: 'Anurag',
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function signIn(email: string, pass: string) {
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function signUp(email: string, pass: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (cred.user) {
    await updateFirebaseProfile(cred.user, { displayName });
    await syncUserProfile(cred.user);
  }
  return cred;
}

export async function signInGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  if (cred.user) {
    await syncUserProfile(cred.user);
  }
  return cred;
}

export async function resetPassword(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export async function logOut() {
  return await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
