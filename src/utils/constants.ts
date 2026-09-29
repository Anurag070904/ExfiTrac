import { PaymentMethod, TaskPriority, TaskStatus } from '../types';

export const DEFAULT_TASK_CATEGORIES = [
  'Study',
  'Work',
  'Personal',
  'Fitness',
  'Coding',
  'Learning',
  'Family',
  'Other',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Fuel',
  'Rent',
  'Travel',
  'Shopping',
  'Bills',
  'Electricity',
  'Internet',
  'Mobile',
  'Education',
  'Healthcare',
  'Entertainment',
  'Groceries',
  'Subscriptions',
  'Investments',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Other',
];

export const PRIORITIES: { value: TaskPriority; label: string; color: string; badgeBg: string }[] = [
  { value: 'low', label: 'Low', color: 'text-slate-500 dark:text-slate-400', badgeBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500 dark:text-blue-400', badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40' },
  { value: 'high', label: 'High', color: 'text-amber-500 dark:text-amber-400', badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40' },
  { value: 'urgent', label: 'Urgent', color: 'text-rose-500 dark:text-rose-400', badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40' },
];

export const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  completed: { label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-100 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
  overdue: { label: 'Overdue', bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
};

export const QUICK_EXPENSE_PRESETS = [
  { label: 'Food', category: 'Food', icon: '☕', amount: 150 },
  { label: 'Fuel', category: 'Fuel', icon: '⛽', amount: 300 },
  { label: 'Grocery', category: 'Groceries', icon: '🛒', amount: 500 },
  { label: 'Travel', category: 'Travel', icon: '🚕', amount: 200 },
  { label: 'Shopping', category: 'Shopping', icon: '🛍', amount: 1000 },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Fuel: '#ef4444',
  Rent: '#8b5cf6',
  Travel: '#06b6d4',
  Shopping: '#ec4899',
  Bills: '#64748b',
  Electricity: '#eab308',
  Internet: '#3b82f6',
  Mobile: '#10b981',
  Education: '#6366f1',
  Healthcare: '#14b8a6',
  Entertainment: '#a855f7',
  Groceries: '#84cc16',
  Subscriptions: '#d946ef',
  Investments: '#059669',
  Study: '#6366f1',
  Work: '#0284c7',
  Personal: '#8b5cf6',
  Fitness: '#10b981',
  Coding: '#f59e0b',
  Learning: '#06b6d4',
  Family: '#ec4899',
  Other: '#94a3b8',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || '#6366f1';
}

export function formatCurrency(amount: number, symbol = '₹'): string {
  if (isNaN(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeGreeting = 'Good Evening';
  } else if (hour >= 21 || hour < 5) {
    timeGreeting = 'Good Night';
  }
  return name ? `${timeGreeting}, ${name} 👋` : `${timeGreeting} 👋`;
}
