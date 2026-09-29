import React, { useState } from 'react';
import {
  Plus,
  Search,
  Receipt,
  Zap,
  Filter,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Expense, PaymentMethod } from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  QUICK_EXPENSE_PRESETS,
  formatCurrency,
  getTodayDateString,
} from '../utils/constants';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const ExpensesPage: React.FC = () => {
  const { expenses, removeExpense, setQuickExpenseOpen, addNewExpense } = useApp();
  const { profile } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.substring(0, 7);

  // Quick preset one-click logger
  const handleQuickPresetLog = async (preset: typeof QUICK_EXPENSE_PRESETS[0]) => {
    await addNewExpense({
      amount: preset.amount,
      category: preset.category,
      description: preset.label,
      paymentMethod: profile?.defaultPaymentMethod || 'UPI',
      date: todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Calculations for expense summary strip
  const activeExpenses = expenses.filter((e) => !e.isArchived);
  const todaySpending = activeExpenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthSpending = activeExpenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalSpending = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Largest expense
  const largestExpense = activeExpenses.reduce(
    (max, e) => (e.amount > max ? e.amount : max),
    0
  );

  // Most used category
  const categoryCounts = new Map<string, number>();
  activeExpenses.forEach((e) => {
    categoryCounts.set(e.category, (categoryCounts.get(e.category) || 0) + 1);
  });
  let mostUsedCategory = 'N/A';
  let maxCount = 0;
  categoryCounts.forEach((count, cat) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedCategory = cat;
    }
  });

  // Filtered transactions
  const filteredExpenses = activeExpenses.filter((e) => {
    if (search && !e.description.toLowerCase().includes(search.toLowerCase()) && !e.category.toLowerCase().includes(search.toLowerCase()) && !e.notes?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedPaymentMethod !== 'all' && e.paymentMethod !== selectedPaymentMethod) return false;

    if (minAmount && e.amount < parseFloat(minAmount)) return false;
    if (maxAmount && e.amount > parseFloat(maxAmount)) return false;

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Personal Expense &amp; Finance Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Log transactions in seconds, monitor cash flow, and inspect receipts.
          </p>
        </div>
        <button
          onClick={() => setQuickExpenseOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" />
          <span>Add Expense (&lt;10s)</span>
        </button>
      </div>

      {/* Quick 1-Tap Preset Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          ⚡ 1-Tap Quick Log Presets
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {QUICK_EXPENSE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handleQuickPresetLog(p)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 active:scale-95"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {formatCurrency(p.amount, profile?.currency || '₹')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Expense Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today&apos;s Spend</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(todaySpending, profile?.currency || '₹')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">This Month</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(thisMonthSpending, profile?.currency || '₹')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Largest Expense</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(largestExpense, profile?.currency || '₹')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Top Category</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1 truncate">
            {mostUsedCategory}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by merchant, description, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
            >
              <option value="all">All Categories</option>
              {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 py-16 px-4 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No transactions found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Start recording expenses or adjust your search filters.
            </p>
            <button
              onClick={() => setQuickExpenseOpen(true)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
            >
              Record First Expense
            </button>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex items-center justify-between gap-4 shadow-2xs"
            >
              <div className="flex items-center gap-3.5 min-w-0 pr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {exp.category.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {exp.description}
                    </h4>
                    {exp.receiptUrl && (
                      <button
                        onClick={() => setSelectedReceipt(exp.receiptUrl || null)}
                        className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform"
                        title="View Receipt"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 flex-wrap">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {exp.category}
                    </span>
                    <span>•</span>
                    <span>{exp.paymentMethod}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {exp.date} {exp.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(exp.amount, profile?.currency || '₹')}
                  </div>
                </div>

                <button
                  onClick={() => setExpenseToDelete(exp)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Archive/Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete/Archive Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!expenseToDelete}
        title="Remove Transaction"
        message={`Are you sure you want to remove this ${formatCurrency(expenseToDelete?.amount || 0, profile?.currency || '₹')} expense for "${expenseToDelete?.description}"? It will be archived securely.`}
        confirmText="Remove"
        isDestructive={true}
        onConfirm={async () => {
          if (expenseToDelete) {
            await removeExpense(expenseToDelete.id, true);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-4 border border-slate-200 dark:border-slate-800 overflow-hidden relative"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Receipt Attachment
              </h3>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedReceipt}
              alt="Receipt"
              className="max-h-[70vh] w-auto mx-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
