export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';

export type TaskRecurring = 'none' | 'daily' | 'weekly' | 'weekdays' | 'monthly';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
  recurring: TaskRecurring;
  reminder?: boolean;
  reminderTime?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  parentRecurringId?: string;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  paymentMethod: PaymentMethod;
  description: string;
  notes?: string;
  receiptUrl?: string; // Data URL or storage URL
  merchant?: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  category: string; // 'total_monthly' or category name
  monthlyLimit: number;
  month: string; // YYYY-MM
  alertThreshold: number; // percentage (e.g. 80)
  createdAt: string;
  updatedAt: string;
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'quarterly';

export interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  amount: number;
  billingCycle: BillingCycle;
  nextPaymentDate: string; // YYYY-MM-DD
  category: string;
  paymentMethod: PaymentMethod;
  active: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'task_reminder' 
  | 'overdue_task' 
  | 'budget_warning' 
  | 'expense_reminder' 
  | 'weekly_report' 
  | 'monthly_report'
  | 'whatsapp_simulated';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  whatsappNumber?: string;
  currency: string; // '₹' | '$' | '€' | '£'
  currencyCode: string; // 'INR' | 'USD' | 'EUR' | 'GBP'
  timezone: string;
  monthlyIncome: number;
  monthlySavingsTarget: number;
  theme: 'light' | 'dark' | 'system';
  whatsappNotifications: {
    enabled: boolean;
    morningBriefing: boolean;
    morningTime: string; // '07:00'
    eveningReview: boolean;
    eveningTime: string; // '20:00'
    expenseReminder: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  customTaskCategories: string[];
  customExpenseCategories: string[];
  defaultPaymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface DailyActivityStats {
  date: string; // YYYY-MM-DD
  totalTasks: number;
  completedTasks: number;
  completionRate: number; // 0-100
  totalExpense: number;
  streakActive: boolean;
}

export interface SmartInsight {
  id: string;
  type: 'productivity' | 'expense' | 'budget' | 'achievement';
  title: string;
  description: string;
  iconName: string;
  trend?: 'up' | 'down' | 'neutral';
  impact?: 'positive' | 'warning' | 'info';
}
