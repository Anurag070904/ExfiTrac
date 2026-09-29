import React from 'react';
import {
  CheckCircle2,
  Clock,
  Flame,
  TrendingUp,
  Receipt,
  Sparkles,
  Plus,
  ArrowRight,
  AlertTriangle,
  Calendar,
  MessageCircle,
  Activity,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  getGreeting,
  PRIORITIES,
  STATUS_CONFIG
} from '../utils/constants';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { profile } = useAuth();
  const {
    todayTasks,
    todayExpenses,
    currentStreak,
    productivityScore,
    todaySpent,
    monthSpent,
    totalMonthlyBudget,
    insights,
    toggleTask,
    setQuickTaskOpen,
    setQuickExpenseOpen,
    setWhatsAppDrawerOpen,
    populateStarterData,
    tasks,
  } = useApp();

  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const pendingToday = totalToday - completedToday;
  const overdueToday = todayTasks.filter((t) => t.status === 'overdue').length;

  const remainingMonthlyBudget = Math.max(0, totalMonthlyBudget - monthSpent);
  const budgetUsedPercentage = totalMonthlyBudget > 0 ? Math.round((monthSpent / totalMonthlyBudget) * 100) : 0;
  const isBudgetWarning = budgetUsedPercentage >= 80 && budgetUsedPercentage < 100;
  const isBudgetExceeded = budgetUsedPercentage >= 100;

  const greeting = getGreeting(profile?.displayName || 'Anurag');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner & Quick Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              TODAY&apos;S OVERVIEW
            </span>
            <span className="text-xs text-indigo-200/80">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}
          </h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-lg">
            Here is your daily pulse. Keep the momentum going and build steady progress!
          </p>
        </div>

        {/* Quick Actions inside Hero */}
        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setQuickTaskOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            onClick={() => setQuickExpenseOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Background decorative orb */}
        <div className="absolute right-0 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Starter data recommendation if zero records exist */}
      {tasks.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Fresh workspace initialized!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Would you like to seed realistic tasks, expenses, budgets, and streak history to explore right away?
              </p>
            </div>
          </div>
          <button
            onClick={populateStarterData}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            Load Sample Data
          </button>
        </div>
      )}

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Progress */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Progress
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {completionPercentage}%
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {completedToday} / {totalToday} Tasks
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Pending: {pendingToday}</span>
            {overdueToday > 0 && (
              <span className="text-rose-500 font-medium">Overdue: {overdueToday}</span>
            )}
          </div>
        </div>

        {/* Card 2: Today's Spending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today&apos;s Spending
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            {formatCurrency(todaySpent, profile?.currency || '₹')}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{todayExpenses.length} transactions recorded</span>
            <button
              onClick={() => setQuickExpenseOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              + Quick
            </button>
          </div>
        </div>

        {/* Card 3: Monthly Spending vs Budget */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Monthly Budget
            </span>
            <div
              className={`p-2 rounded-xl ${
                isBudgetExceeded
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                  : isBudgetWarning
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(monthSpent, profile?.currency || '₹')}
            </div>
            <div className="text-xs font-medium text-slate-400">
              / {formatCurrency(totalMonthlyBudget, profile?.currency || '₹')}
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBudgetExceeded
                  ? 'bg-rose-500'
                  : isBudgetWarning
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, budgetUsedPercentage)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2">
            <span
              className={
                isBudgetExceeded
                  ? 'text-rose-600 font-semibold'
                  : isBudgetWarning
                  ? 'text-amber-600 font-semibold'
                  : 'text-slate-400'
              }
            >
              {isBudgetExceeded
                ? `Exceeded by ${formatCurrency(monthSpent - totalMonthlyBudget, profile?.currency || '₹')}`
                : `Rem: ${formatCurrency(remainingMonthlyBudget, profile?.currency || '₹')}`}
            </span>
            <span className="text-slate-400">{budgetUsedPercentage}% used</span>
          </div>
        </div>

        {/* Card 4: Streak & Productivity Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Streak & Score
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
              <span>🔥 {currentStreak}</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Days</span>
            </div>
            <div className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Score: {productivityScore}/100
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {currentStreak > 0
              ? 'Outstanding consistency! Keep finishing planned tasks daily.'
              : 'Complete today’s tasks to ignite your productivity streak!'}
          </p>
        </div>
      </div>

      {/* Main Section Grid: Today's Tasks & Today's Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks List (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Today&apos;s Tasks &amp; Habits ({completedToday}/{totalToday})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickTaskOpen(true)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {todayTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No tasks scheduled for today 🎯
                </p>
                <p className="text-xs mt-1">Enjoy your free time or schedule a new task to stay ahead.</p>
                <button
                  onClick={() => setQuickTaskOpen(true)}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Create Today&apos;s First Task
                </button>
              </div>
            ) : (
              todayTasks.map((t) => {
                const priorityObj = PRIORITIES.find((p) => p.value === t.priority);
                const isCompleted = t.status === 'completed';

                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <button
                        onClick={() => toggleTask(t)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
                            {t.category}
                          </span>
                          {t.startTime && (
                            <span className="flex items-center gap-0.5 text-[11px]">
                              <Clock className="w-3 h-3" />
                              {t.startTime}
                            </span>
                          )}
                          {t.recurring !== 'none' && (
                            <span className="text-indigo-500 font-medium text-[10px]">
                              🔁 {t.recurring}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {priorityObj && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityObj.badgeBg}`}>
                          {priorityObj.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Today's Expenses Panel (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Today&apos;s Expenses
              </h3>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-medium text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-0.5"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            {todayExpenses.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No expenses recorded today 💰
                </p>
                <p className="text-xs mt-1">Your spending is currently {formatCurrency(0, profile?.currency || '₹')}.</p>
                <button
                  onClick={() => setQuickExpenseOpen(true)}
                  className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold"
                >
                  Record Quick Expense
                </button>
              </div>
            ) : (
              todayExpenses.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {e.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{e.category}</span>
                      <span>•</span>
                      <span>{e.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(e.amount, profile?.currency || '₹')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Record Button */}
          <button
            onClick={() => setQuickExpenseOpen(true)}
            className="w-full mt-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense (&lt;10s)</span>
          </button>
        </div>
      </div>

      {/* Smart Insights & WhatsApp Hub Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Insights Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Smart Behavioral Insights
            </h3>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 2).map((ins) => (
              <div
                key={ins.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                    {ins.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {ins.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp Automation Quick Card */}
        <div className="bg-gradient-to-br from-[#075E54]/10 via-emerald-500/10 to-[#128C7E]/10 p-6 rounded-2xl border border-[#128C7E]/30 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-1.5 uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 fill-current" />
                WhatsApp Notification Bot
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Active Simulator
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Automated 7 AM Morning &amp; 8 PM Evening Sync
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Connected to <span className="font-semibold text-slate-900 dark:text-white">{profile?.whatsappNumber || '+91 8767377234'}</span>. Test daily productivity reminders and weekly spending summaries instantly.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setWhatsAppDrawerOpen(true)}
              className="flex-1 py-2.5 px-4 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Open WhatsApp Bot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
