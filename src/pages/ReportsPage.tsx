import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Printer,
  Sparkles,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getTodayDateString } from '../utils/constants';

export const ReportsPage: React.FC = () => {
  const { tasks, expenses, budgets, subscriptions } = useApp();
  const { profile } = useAuth();

  const [activeReport, setActiveReport] = useState<'weekly-prod' | 'monthly-fin'>('weekly-prod');
  const currencySymbol = profile?.currency || '₹';

  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.substring(0, 7);

  // Weekly Productivity calculations (Past 7 days)
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyTasks = tasks.filter((t) => !t.isArchived && past7Days.includes(t.date));
  const weeklyPlanned = weeklyTasks.length;
  const weeklyCompleted = weeklyTasks.filter((t) => t.status === 'completed').length;
  const weeklyCompletionRate =
    weeklyPlanned > 0 ? Math.round((weeklyCompleted / weeklyPlanned) * 100) : 0;
  const weeklyMissed = weeklyPlanned - weeklyCompleted;

  // Best day and weakest day in the week
  const dayStatsMap = new Map<string, { total: number; completed: number; dayName: string }>();
  past7Days.forEach((dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const dayTasks = tasks.filter((t) => !t.isArchived && t.date === dateStr);
    const dayCompleted = dayTasks.filter((t) => t.status === 'completed').length;
    dayStatsMap.set(dateStr, { total: dayTasks.length, completed: dayCompleted, dayName });
  });

  let bestDayName = 'N/A';
  let bestRate = -1;
  let weakestDayName = 'N/A';
  let weakestRate = 101;

  dayStatsMap.forEach((stat) => {
    if (stat.total > 0) {
      const rate = Math.round((stat.completed / stat.total) * 100);
      if (rate > bestRate) {
        bestRate = rate;
        bestDayName = `${stat.dayName} (${rate}%)`;
      }
      if (rate < weakestRate) {
        weakestRate = rate;
        weakestDayName = `${stat.dayName} (${rate}%)`;
      }
    }
  });

  // Monthly Finance Calculations
  const monthlyExpenses = expenses.filter(
    (e) => !e.isArchived && e.date.startsWith(currentMonthStr)
  );
  const totalMonthExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Distinct spending days
  const spendingDaysCount = Math.max(1, new Set(monthlyExpenses.map((e) => e.date)).size);
  const avgDailySpending = Math.round(totalMonthExpense / spendingDaysCount);

  // Highest spending day
  const dailySpendMap = new Map<string, number>();
  monthlyExpenses.forEach((e) => {
    dailySpendMap.set(e.date, (dailySpendMap.get(e.date) || 0) + e.amount);
  });
  let highestSpendDay = 'N/A';
  let highestSpendAmount = 0;
  dailySpendMap.forEach((amount, date) => {
    if (amount > highestSpendAmount) {
      highestSpendAmount = amount;
      highestSpendDay = `${date} (${formatCurrency(amount, currencySymbol)})`;
    }
  });

  // Largest category
  const catSpendMap = new Map<string, number>();
  monthlyExpenses.forEach((e) => {
    catSpendMap.set(e.category, (catSpendMap.get(e.category) || 0) + e.amount);
  });
  let largestCategory = 'N/A';
  let largestCatAmount = 0;
  catSpendMap.forEach((amount, cat) => {
    if (amount > largestCatAmount) {
      largestCatAmount = amount;
      largestCategory = `${cat} (${formatCurrency(amount, currencySymbol)})`;
    }
  });

  // CSV Exporters
  const exportTasksCSV = () => {
    const headers = ['Task ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Date', 'Start Time', 'Recurring'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.date,
      t.startTime || '',
      t.recurring,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifeos_tasks_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpensesCSV = () => {
    const headers = ['Expense ID', 'Description', 'Amount', 'Category', 'Payment Method', 'Date', 'Time', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      e.category,
      e.paymentMethod,
      e.date,
      e.time,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `lifeos_expenses_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportFullJSON = () => {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      tasks,
      expenses,
      budgets,
      subscriptions,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `lifeos_complete_backup_${todayStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Executive Reports &amp; Data Export
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate formal weekly productivity recaps, monthly financial statements, and export data in CSV/JSON.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveReport('weekly-prod')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'weekly-prod'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Weekly Productivity Report
        </button>
        <button
          onClick={() => setActiveReport('monthly-fin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeReport === 'monthly-fin'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Monthly Financial Statement
        </button>
      </div>

      {/* Report Container */}
      {activeReport === 'weekly-prod' ? (
        /* Weekly Productivity Report Card */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                EXECUTIVE SUMMARY
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Weekly Productivity Audit
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated from {past7Days[0]} to {past7Days[past7Days.length - 1]}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {weeklyCompletionRate}%
              </span>
              <span className="text-xs text-slate-400 block font-semibold">Completion Rate</span>
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tasks Planned</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {weeklyPlanned}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Tasks Completed</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">
                {weeklyCompleted}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Missed / Pending</span>
              <span className="text-xl font-black text-amber-500 mt-1 block">
                {weeklyMissed}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Best Execution Day</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">
                {bestDayName}
              </span>
            </div>
          </div>

          {/* Detailed breakdown list */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Daily Breakdown (Past 7 Days)
            </h4>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
              {past7Days.map((dateStr) => {
                const stat = dayStatsMap.get(dateStr);
                const rate = stat && stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
                return (
                  <div key={dateStr} className="p-3.5 flex items-center justify-between text-xs bg-white dark:bg-slate-900">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stat?.dayName}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-2 font-mono">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">
                        {stat?.completed} / {stat?.total} completed
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        rate >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {rate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Monthly Financial Statement Card */
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                CASH FLOW AUDIT
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Monthly Financial Statement
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cycle: {currentMonthStr} • Real-time database ledger
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalMonthExpense, currencySymbol)}
              </span>
              <span className="text-xs text-slate-400 block font-semibold">Total Outflow</span>
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Daily Average Spend</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {formatCurrency(avgDailySpending, currencySymbol)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Top Category</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">
                {largestCategory}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Peak Spending Day</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white mt-1 block truncate">
                {highestSpendDay}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Transactions</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {monthlyExpenses.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Data Export & Backup Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <span>Data Export &amp; Backup Center</span>
          </h3>
          <p className="text-xs text-slate-500">
            Own your data. Export your entire LIFEOS history anytime in standard CSV or full JSON formats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={exportTasksCSV}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Export Tasks (.CSV)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                All planned, completed, and recurring tasks with timestamps.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-3">
              <Download className="w-3.5 h-3.5" /> Download CSV
            </div>
          </button>

          <button
            onClick={exportExpensesCSV}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Export Expenses (.CSV)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Full transaction logs with amounts, categories, and payment methods.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-3">
              <Download className="w-3.5 h-3.5" /> Download CSV
            </div>
          </button>

          <button
            onClick={exportFullJSON}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Full Backup (.JSON)</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Complete database snapshot including settings, budgets, and subscriptions.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 mt-3">
              <Download className="w-3.5 h-3.5" /> Download JSON
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
