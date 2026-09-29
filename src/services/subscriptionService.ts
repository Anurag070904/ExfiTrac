import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Subscription } from '../types';

const SUBS_COLLECTION = (userId: string) => collection(db, 'users', userId, 'subscriptions');

export async function createSubscription(
  userId: string,
  data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(SUBS_COLLECTION(userId), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateSubscription(
  userId: string,
  subId: string,
  updates: Partial<Subscription>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'subscriptions', subId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSubscription(userId: string, subId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'subscriptions', subId);
  await deleteDoc(docRef);
}

export function subscribeToSubscriptions(userId: string, callback: (subs: Subscription[]) => void) {
  const q = query(SUBS_COLLECTION(userId));
  return onSnapshot(q, (snapshot) => {
    const list: Subscription[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<Subscription, 'id'>) });
    });
    callback(list);
  }, (err) => console.error('Error subscribeToSubscriptions:', err));
}

export function calculateMonthlySubscriptionTotal(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.amount;
      if (s.billingCycle === 'yearly') return sum + s.amount / 12;
      if (s.billingCycle === 'weekly') return sum + s.amount * 4.33;
      if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
      return sum + s.amount;
    }, 0);
}
