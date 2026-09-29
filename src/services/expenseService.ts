import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Expense } from '../types';
import { getCurrentTimeString, getTodayDateString } from '../utils/constants';

const EXPENSES_COLLECTION = (userId: string) => collection(db, 'users', userId, 'expenses');

export async function createExpense(
  userId: string,
  data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const expenseData: Omit<Expense, 'id'> = {
    ...data,
    userId,
    date: data.date || getTodayDateString(),
    time: data.time || getCurrentTimeString(),
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };

  const docRef = await addDoc(EXPENSES_COLLECTION(userId), expenseData);
  return docRef.id;
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
  await updateDoc(expenseRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteExpense(userId: string, expenseId: string, softDelete = true): Promise<void> {
  const expenseRef = doc(db, 'users', userId, 'expenses', expenseId);
  if (softDelete) {
    await updateDoc(expenseRef, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
  } else {
    await deleteDoc(expenseRef);
  }
}

export function subscribeToExpenses(userId: string, callback: (expenses: Expense[]) => void) {
  const q = query(EXPENSES_COLLECTION(userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses: Expense[] = [];
    snapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...(doc.data() as Omit<Expense, 'id'>) });
    });
    callback(expenses);
  }, (error) => {
    console.error('Error in subscribeToExpenses:', error);
  });
}

/**
 * Compresses an image file to Base64 data URL for receipt storage
 */
export function processReceiptImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
