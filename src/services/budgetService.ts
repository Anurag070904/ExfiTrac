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
import { Budget, Expense } from '../types';

const BUDGETS_COLLECTION = (userId: string) => collection(db, 'users', userId, 'budgets');

export async function createBudget(
  userId: string,
  data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(BUDGETS_COLLECTION(userId), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function updateBudget(
  userId: string,
  budgetId: string,
  updates: Partial<Budget>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteBudget(userId: string, budgetId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'budgets', budgetId);
  await deleteDoc(docRef);
}

export function subscribeToBudgets(userId: string, callback: (budgets: Budget[]) => void) {
  const q = query(BUDGETS_COLLECTION(userId));
  return onSnapshot(q, (snapshot) => {
    const list: Budget[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<Budget, 'id'>) });
    });
    callback(list);
  }, (err) => console.error('Error subscribeToBudgets:', err));
}

export interface BudgetStatusInfo {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isWarning: boolean;
  isExceeded: boolean;
  statusText: string;
}

export function evaluateBudget(budget: Budget, monthExpenses: Expense[]): BudgetStatusInfo {
  let relevantExpenses: Expense[];
  if (budget.category === 'total_monthly') {
    relevantExpenses = monthExpenses.filter((e) => !e.isArchived);
  } else {
    relevantExpenses = monthExpenses.filter(
      (e) => !e.isArchived && e.category.toLowerCase() === budget.category.toLowerCase()
    );
  }

  const spent = relevantExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = budget.monthlyLimit - spent;
  const percentage = budget.monthlyLimit > 0 ? Math.round((spent / budget.monthlyLimit) * 100) : 0;
  const isExceeded = spent > budget.monthlyLimit;
  const isWarning = !isExceeded && percentage >= (budget.alertThreshold || 80);

  let statusText = `${percentage}% used`;
  if (isExceeded) {
    statusText = `🔴 ${budget.category === 'total_monthly' ? 'Monthly' : budget.category} budget exceeded by ${Math.abs(remaining).toLocaleString()}`;
  } else if (isWarning) {
    statusText = `⚠️ ${budget.category === 'total_monthly' ? 'Monthly' : budget.category} budget is ${percentage}% used`;
  }

  return {
    budget,
    spent,
    remaining,
    percentage,
    isWarning,
    isExceeded,
    statusText,
  };
}
