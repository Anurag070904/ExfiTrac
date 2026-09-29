import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  AppNotification,
  Budget,
  Expense,
  SmartInsight,
  Subscription,
  Task,
  UserProfile
} from '../types';
import {
  archiveTask,
  createTask,
  deleteTask,
  duplicateTask,
  subscribeToTasks,
  toggleTaskComplete,
  updateTask
} from '../services/taskService';
import {
  createExpense,
  deleteExpense,
  subscribeToExpenses,
  updateExpense
} from '../services/expenseService';
import {
  createBudget,
  deleteBudget,
  subscribeToBudgets,
  updateBudget
} from '../services/budgetService';
import {
  createSubscription,
  deleteSubscription,
  subscribeToSubscriptions,
  updateSubscription
} from '../services/subscriptionService';
import {
  createInAppNotification,
  deleteInAppNotification,
  generateEveningMessage,
  generateExpenseReminderMessage,
  generateMorningMessage,
  generateWeeklyReportMessage,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NotificationService,
  SimulatedWhatsAppMessage,
  subscribeToNotifications,
  subscribeToSimulatedWhatsApp
} from '../services/notificationService';
import {
  calculateProductivityScore,
  calculateStreak,
  generateSmartInsights
} from '../services/analyticsService';
import { getTodayDateString } from '../utils/constants';

interface AppContextType {
  tasks: Task[];
  expenses: Expense[];
  budgets: Budget[];
  subscriptions: Subscription[];
  notifications: AppNotification[];
  simulatedWhatsAppMessages: SimulatedWhatsAppMessage[];
  insights: SmartInsight[];
  todayTasks: Task[];
  todayExpenses: Expense[];
  currentStreak: number;
  productivityScore: number;
  monthSpent: number;
  todaySpent: number;
  totalMonthlyBudget: number;
  loadingData: boolean;

  // Task methods
  addNewTask: (data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  modifyTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  cloneTask: (task: Task) => Promise<string>;
  archiveTaskItem: (taskId: string) => Promise<void>;

  // Expense methods
  addNewExpense: (data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  modifyExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  removeExpense: (expenseId: string, softDelete?: boolean) => Promise<void>;

  // Budget methods
  addNewBudget: (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  modifyBudget: (budgetId: string, updates: Partial<Budget>) => Promise<void>;
  removeBudget: (budgetId: string) => Promise<void>;

  // Subscription methods
  addNewSubscription: (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  modifySubscription: (subId: string, updates: Partial<Subscription>) => Promise<void>;
  removeSubscription: (subId: string) => Promise<void>;

  // Notification & WhatsApp
  readNotification: (id: string) => Promise<void>;
  readAllNotifications: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  triggerWhatsAppMorningBriefing: () => Promise<void>;
  triggerWhatsAppEveningReview: () => Promise<void>;
  triggerWhatsAppExpenseReminder: () => Promise<void>;
  triggerWhatsAppWeeklySummary: () => Promise<void>;

  // UI state triggers
  quickTaskOpen: boolean;
  setQuickTaskOpen: (open: boolean) => void;
  quickExpenseOpen: boolean;
  setQuickExpenseOpen: (open: boolean) => void;
  whatsAppDrawerOpen: boolean;
  setWhatsAppDrawerOpen: (open: boolean) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Starter demo data populator
  populateStarterData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, profile } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [simulatedWhatsAppMessages, setSimulatedWhatsAppMessages] = useState<SimulatedWhatsAppMessage[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // UI Modals
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const [whatsAppDrawerOpen, setWhatsAppDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Subscriptions to Firestore data
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setExpenses([]);
      setBudgets([]);
      setSubscriptions([]);
      setNotifications([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    const unsubTasks = subscribeToTasks(currentUser.uid, (data) => {
      setTasks(data);
      setLoadingData(false);
    });

    const unsubExpenses = subscribeToExpenses(currentUser.uid, (data) => {
      setExpenses(data);
    });

    const unsubBudgets = subscribeToBudgets(currentUser.uid, (data) => {
      setBudgets(data);
    });

    const unsubSubs = subscribeToSubscriptions(currentUser.uid, (data) => {
      setSubscriptions(data);
    });

    const unsubNotifs = subscribeToNotifications(currentUser.uid, (data) => {
      setNotifications(data);
    });

    const unsubSim = subscribeToSimulatedWhatsApp((messages) => {
      setSimulatedWhatsAppMessages(messages);
    });

    return () => {
      unsubTasks();
      unsubExpenses();
      unsubBudgets();
      unsubSubs();
      unsubNotifs();
      unsubSim();
    };
  }, [currentUser]);

  // Derived statistics
  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.substring(0, 7);

  const todayTasks = tasks.filter((t) => t.date === todayStr && !t.isArchived);
  const todayExpenses = expenses.filter((e) => e.date === todayStr && !e.isArchived);

  const currentStreak = calculateStreak(tasks);
  const productivityScore = calculateProductivityScore(todayTasks);

  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthSpent = expenses
    .filter((e) => e.date.startsWith(currentMonthStr) && !e.isArchived)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMonthlyBudget =
    budgets.find((b) => b.category === 'total_monthly')?.monthlyLimit ||
    (profile?.monthlyIncome ? profile.monthlyIncome * 0.6 : 25000);

  const insights = generateSmartInsights(tasks, expenses, budgets, profile?.currency || '₹');

  // Task actions
  const addNewTask = useCallback(
    async (data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) throw new Error('Not authenticated');
      return await createTask(currentUser.uid, data);
    },
    [currentUser]
  );

  const modifyTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      if (!currentUser) return;
      await updateTask(currentUser.uid, taskId, updates);
    },
    [currentUser]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!currentUser) return;
      await deleteTask(currentUser.uid, taskId);
    },
    [currentUser]
  );

  const toggleTask = useCallback(
    async (task: Task) => {
      if (!currentUser) return;
      await toggleTaskComplete(currentUser.uid, task);
    },
    [currentUser]
  );

  const cloneTask = useCallback(
    async (task: Task) => {
      if (!currentUser) throw new Error('Not authenticated');
      return await duplicateTask(currentUser.uid, task);
    },
    [currentUser]
  );

  const archiveTaskItem = useCallback(
    async (taskId: string) => {
      if (!currentUser) return;
      await archiveTask(currentUser.uid, taskId, true);
    },
    [currentUser]
  );

  // Expense actions
  const addNewExpense = useCallback(
    async (data: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) throw new Error('Not authenticated');
      const id = await createExpense(currentUser.uid, data);

      // Check if budget threshold is crossed
      const catBudget = budgets.find(
        (b) => b.category.toLowerCase() === data.category.toLowerCase()
      );
      if (catBudget) {
        const catTotal = expenses
          .filter((e) => !e.isArchived && e.category.toLowerCase() === data.category.toLowerCase() && e.date.startsWith(currentMonthStr))
          .reduce((sum, e) => sum + e.amount, 0) + data.amount;

        if (catTotal > catBudget.monthlyLimit) {
          await createInAppNotification(currentUser.uid, {
            title: `⚠️ Budget Alert: ${catBudget.category}`,
            message: `You have exceeded your ${catBudget.category} budget of ${profile?.currency || '₹'}${catBudget.monthlyLimit} (Current: ${profile?.currency || '₹'}${catTotal})`,
            type: 'budget_warning',
          });
        }
      }

      return id;
    },
    [currentUser, budgets, expenses, currentMonthStr, profile]
  );

  const modifyExpense = useCallback(
    async (expenseId: string, updates: Partial<Expense>) => {
      if (!currentUser) return;
      await updateExpense(currentUser.uid, expenseId, updates);
    },
    [currentUser]
  );

  const removeExpense = useCallback(
    async (expenseId: string, softDelete = true) => {
      if (!currentUser) return;
      await deleteExpense(currentUser.uid, expenseId, softDelete);
    },
    [currentUser]
  );

  // Budget actions
  const addNewBudget = useCallback(
    async (data: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) throw new Error('Not authenticated');
      return await createBudget(currentUser.uid, data);
    },
    [currentUser]
  );

  const modifyBudget = useCallback(
    async (budgetId: string, updates: Partial<Budget>) => {
      if (!currentUser) return;
      await updateBudget(currentUser.uid, budgetId, updates);
    },
    [currentUser]
  );

  const removeBudget = useCallback(
    async (budgetId: string) => {
      if (!currentUser) return;
      await deleteBudget(currentUser.uid, budgetId);
    },
    [currentUser]
  );

  // Subscription actions
  const addNewSubscription = useCallback(
    async (data: Omit<Subscription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      if (!currentUser) throw new Error('Not authenticated');
      return await createSubscription(currentUser.uid, data);
    },
    [currentUser]
  );

  const modifySubscription = useCallback(
    async (subId: string, updates: Partial<Subscription>) => {
      if (!currentUser) return;
      await updateSubscription(currentUser.uid, subId, updates);
    },
    [currentUser]
  );

  const removeSubscription = useCallback(
    async (subId: string) => {
      if (!currentUser) return;
      await deleteSubscription(currentUser.uid, subId);
    },
    [currentUser]
  );

  // Notification actions
  const readNotification = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      await markNotificationAsRead(currentUser.uid, id);
    },
    [currentUser]
  );

  const readAllNotifications = useCallback(async () => {
    if (!currentUser) return;
    await markAllNotificationsAsRead(currentUser.uid, notifications);
  }, [currentUser, notifications]);

  const removeNotification = useCallback(
    async (id: string) => {
      if (!currentUser) return;
      await deleteInAppNotification(currentUser.uid, id);
    },
    [currentUser]
  );

  // WhatsApp simulation triggers
  const triggerWhatsAppMorningBriefing = useCallback(async () => {
    if (!currentUser) return;
    const msg = generateMorningMessage(profile?.displayName || 'Anurag', todayTasks);
    await NotificationService.sendWhatsApp({
      to: profile?.whatsappNumber || '+91 8767377234',
      message: msg,
      type: 'morning',
    });
    await createInAppNotification(currentUser.uid, {
      title: '🌅 Morning Briefing Sent via WhatsApp',
      message: msg,
      type: 'task_reminder',
    });
    setWhatsAppDrawerOpen(true);
  }, [currentUser, profile, todayTasks]);

  const triggerWhatsAppEveningReview = useCallback(async () => {
    if (!currentUser) return;
    const msg = generateEveningMessage(todayTasks);
    await NotificationService.sendWhatsApp({
      to: profile?.whatsappNumber || '+91 8767377234',
      message: msg,
      type: 'evening',
    });
    await createInAppNotification(currentUser.uid, {
      title: '📊 Daily Productivity Review Sent',
      message: msg,
      type: 'weekly_report',
    });
    setWhatsAppDrawerOpen(true);
  }, [currentUser, profile, todayTasks]);

  const triggerWhatsAppExpenseReminder = useCallback(async () => {
    if (!currentUser) return;
    const msg = generateExpenseReminderMessage();
    await NotificationService.sendWhatsApp({
      to: profile?.whatsappNumber || '+91 8767377234',
      message: msg,
      type: 'expense',
    });
    await createInAppNotification(currentUser.uid, {
      title: '💰 Expense Reminder Sent',
      message: msg,
      type: 'expense_reminder',
    });
    setWhatsAppDrawerOpen(true);
  }, [currentUser, profile]);

  const triggerWhatsAppWeeklySummary = useCallback(async () => {
    if (!currentUser) return;
    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 85;
    const msg = generateWeeklyReportMessage(
      completedTasksCount || 31,
      completionRate,
      monthSpent || 12450,
      profile?.currency || '₹'
    );
    await NotificationService.sendWhatsApp({
      to: profile?.whatsappNumber || '+91 8767377234',
      message: msg,
      type: 'weekly',
    });
    await createInAppNotification(currentUser.uid, {
      title: '📈 Weekly Summary Dispatched',
      message: msg,
      type: 'weekly_report',
    });
    setWhatsAppDrawerOpen(true);
  }, [currentUser, tasks, monthSpent, profile]);

  // Seed sample data for testing/demo
  const populateStarterData = useCallback(async () => {
    if (!currentUser) return;

    // Create default budgets
    await addNewBudget({
      category: 'total_monthly',
      monthlyLimit: 25000,
      month: currentMonthStr,
      alertThreshold: 80,
    });
    await addNewBudget({
      category: 'Food',
      monthlyLimit: 6000,
      month: currentMonthStr,
      alertThreshold: 80,
    });
    await addNewBudget({
      category: 'Fuel',
      monthlyLimit: 3000,
      month: currentMonthStr,
      alertThreshold: 80,
    });
    await addNewBudget({
      category: 'Shopping',
      monthlyLimit: 4000,
      month: currentMonthStr,
      alertThreshold: 80,
    });

    // Create subscriptions
    await addNewSubscription({
      serviceName: 'Netflix Premium',
      amount: 649,
      billingCycle: 'monthly',
      nextPaymentDate: `${currentMonthStr}-15`,
      category: 'Entertainment',
      paymentMethod: 'Credit Card',
      active: true,
      notes: '4K Ultra HD Family plan',
    });
    await addNewSubscription({
      serviceName: 'Spotify Duo',
      amount: 149,
      billingCycle: 'monthly',
      nextPaymentDate: `${currentMonthStr}-20`,
      category: 'Entertainment',
      paymentMethod: 'UPI',
      active: true,
    });
    await addNewSubscription({
      serviceName: 'AWS Cloud Services',
      amount: 1850,
      billingCycle: 'monthly',
      nextPaymentDate: `${currentMonthStr}-28`,
      category: 'Work',
      paymentMethod: 'Credit Card',
      active: true,
    });

    // Create historical tasks and expenses for realistic past 7 days + today
    const sampleTaskTemplates = [
      { title: 'DSA Practice: LeetCode Graph problems', category: 'Coding', priority: 'high' as const, time: '07:00' },
      { title: 'Morning Gym Session - Chest & Triceps', category: 'Fitness', priority: 'medium' as const, time: '08:30' },
      { title: 'Team Sprint Planning & Jira sync', category: 'Work', priority: 'urgent' as const, time: '10:00' },
      { title: 'Review Pull Request #412 for API gateway', category: 'Coding', priority: 'high' as const, time: '14:00' },
      { title: 'Read 2 chapters of System Design Interview', category: 'Study', priority: 'medium' as const, time: '18:00' },
      { title: 'Call parents and check on weekend plans', category: 'Family', priority: 'low' as const, time: '20:30' },
    ];

    const sampleExpenses = [
      { amount: 180, category: 'Food', desc: 'Breakfast & Filter Coffee', method: 'UPI' as const },
      { amount: 500, category: 'Fuel', desc: 'Petrol refill for bike', method: 'UPI' as const },
      { amount: 350, category: 'Food', desc: 'Healthy Salad Lunch', method: 'Credit Card' as const },
      { amount: 1200, category: 'Groceries', desc: 'Weekly vegetables and pantry', method: 'UPI' as const },
      { amount: 240, category: 'Travel', desc: 'Uber auto to co-working hub', method: 'UPI' as const },
    ];

    // Seed for today
    for (let i = 0; i < sampleTaskTemplates.length; i++) {
      const t = sampleTaskTemplates[i];
      await addNewTask({
        title: t.title,
        category: t.category,
        priority: t.priority,
        status: i < 4 ? 'completed' : 'pending',
        date: todayStr,
        startTime: t.time,
        recurring: i === 0 ? 'daily' : 'none',
        completedAt: i < 4 ? new Date().toISOString() : null,
      });
    }

    for (let i = 0; i < 3; i++) {
      const e = sampleExpenses[i];
      await addNewExpense({
        amount: e.amount,
        category: e.category,
        description: e.desc,
        paymentMethod: e.method,
        date: todayStr,
        time: '12:30',
      });
    }

    // Seed past 5 days for streak & heatmap
    for (let dayOffset = 1; dayOffset <= 6; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() - dayOffset);
      const dStr = d.toISOString().split('T')[0];

      // Add 4 completed tasks per past day
      for (let j = 0; j < 4; j++) {
        const t = sampleTaskTemplates[j];
        await addNewTask({
          title: t.title,
          category: t.category,
          priority: t.priority,
          status: 'completed',
          date: dStr,
          startTime: t.time,
          recurring: 'none',
          completedAt: d.toISOString(),
        });
      }

      // Add 1-2 expenses
      const exp = sampleExpenses[dayOffset % sampleExpenses.length];
      await addNewExpense({
        amount: exp.amount + dayOffset * 20,
        category: exp.category,
        description: exp.desc,
        paymentMethod: exp.method,
        date: dStr,
        time: '14:15',
      });
    }

    // Seed initial notification
    await createInAppNotification(currentUser.uid, {
      title: '🌟 Welcome to LIFEOS',
      message: 'Your personal workspace is ready. Today tasks and initial finances have been loaded!',
      type: 'task_reminder',
    });
  }, [currentUser, currentMonthStr, todayStr, addNewBudget, addNewSubscription, addNewTask, addNewExpense]);

  return (
    <AppContext.Provider
      value={{
        tasks,
        expenses,
        budgets,
        subscriptions,
        notifications,
        simulatedWhatsAppMessages,
        insights,
        todayTasks,
        todayExpenses,
        currentStreak,
        productivityScore,
        monthSpent,
        todaySpent,
        totalMonthlyBudget,
        loadingData,

        addNewTask,
        modifyTask,
        removeTask,
        toggleTask,
        cloneTask,
        archiveTaskItem,

        addNewExpense,
        modifyExpense,
        removeExpense,

        addNewBudget,
        modifyBudget,
        removeBudget,

        addNewSubscription,
        modifySubscription,
        removeSubscription,

        readNotification,
        readAllNotifications,
        removeNotification,
        triggerWhatsAppMorningBriefing,
        triggerWhatsAppEveningReview,
        triggerWhatsAppExpenseReminder,
        triggerWhatsAppWeeklySummary,

        quickTaskOpen,
        setQuickTaskOpen,
        quickExpenseOpen,
        setQuickExpenseOpen,
        whatsAppDrawerOpen,
        setWhatsAppDrawerOpen,
        searchModalOpen,
        setSearchModalOpen,

        populateStarterData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
