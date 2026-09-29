import React, { useState } from 'react';
import {
  Plus,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Target,
  Trash2,
  Edit2,
  ShieldAlert,
  Percent
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { evaluateBudget } from '../services/budgetService';
import { DEFAULT_EXPENSE_CATEGORIES, formatCurrency, getTodayDateString } from '../utils/constants';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Budget } from '../types';

export const BudgetsPage: React.FC = () => {
  const { budgets, expenses, addNewBudget, modifyBudget, removeBudget } = useApp();
  const { profile, updateProfileData } = useAuth();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Form states
  const [category, setCategory] = useState<string>('Food');
  const [monthlyLimit, setMonthlyLimit] = useState<string>('');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  // Income & Savings Settings
  const [income, setIncome] = useState<string>(String(profile?.monthlyIncome || 50000));
  const [savingsTarget, setSavingsTarget] = useState<string>(
    String(profile?.monthlySavingsTarget || 15000)
  );
  const [savingIncomeSettings, setSavingIncomeSettings] = useState(false);

  const currencySymbol = profile?.currency || '₹';
  const todayStr = getTodayDateString();
  const currentMonthStr = todayStr.substring(0, 7);

  const activeExpenses = expenses.filter((e) => !e.isArchived);
  const currentMonthExpenses = activeExpenses.filter((e) => e.date.startsWith(currentMonthStr));
  const currentMonthTotalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Savings calculations
  const parsedIncome = parseFloat(income) || 0;
  const parsedTarget = parseFloat(savingsTarget) || 0;
  const currentSavings = Math.max(0, parsedIncome - currentMonthTotalSpent);
  const savingsRate = parsedIncome > 0 ? ((currentSavings / parsedIncome) * 100).toFixed(1) : '0';
  const savingsProgress =
    parsedTarget > 0 ? Math.min(100, Math.round((currentSavings / parsedTarget) * 100)) : 0;

  const handleSaveIncomeSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingIncomeSettings(true);
    try {
      await updateProfileData({
        monthlyIncome: parsedIncome,
        monthlySavingsTarget: parsedTarget,
      });
    } finally {
      setSavingIncomeSettings(false);
    }
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(monthlyLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    if (editingBudget) {
      await modifyBudget(editingBudget.id, {
        category,
        monthlyLimit: limitNum,
        alertThreshold,
      });
      setEditingBudget(null);
    } else {
      await addNewBudget({
        category,
        monthlyLimit: limitNum,
        month: currentMonthStr,
        alertThreshold,
      });
      setIsAddBudgetOpen(false);
    }

    setCategory('Food');
    setMonthlyLimit('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Budgets &amp; Savings Target
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set guardrails per category, track savings velocity, and prevent overspending.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBudget(null);
            setCategory('Food');
            setMonthlyLimit('');
            setIsAddBudgetOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category Budget</span>
        </button>
      </div>

      {/* Section 1: Savings Tracker Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Savings Target &amp; Wealth Velocity
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <span className="text-[11px] text-indigo-300 block">Monthly Income</span>
                <span className="text-lg font-black">
                  {formatCurrency(parsedIncome, currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block">Current Expenses</span>
                <span className="text-lg font-black text-rose-300">
                  {formatCurrency(currentMonthTotalSpent, currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block">Net Saved Money</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatCurrency(currentSavings, currencySymbol)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-indigo-300 block">Savings Rate</span>
                <span className="text-lg font-black text-indigo-200">
                  {savingsRate}%
                </span>
              </div>
            </div>

            {/* Progress bar towards target */}
            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Target: {formatCurrency(parsedTarget, currencySymbol)}</span>
                <span className="font-bold">{savingsProgress}% Achieved</span>
              </div>
              <div className="w-full bg-white/15 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick config settings */}
          <form
            onSubmit={handleSaveIncomeSettings}
            className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3 shrink-0 lg:w-72"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Adjust Income &amp; Goals
            </h4>
            <div>
              <label className="text-[10px] text-indigo-200 block mb-1">Monthly Income ({currencySymbol})</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/30 border border-white/20 rounded-xl text-xs text-white outline-hidden focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] text-indigo-200 block mb-1">Savings Target ({currencySymbol})</label>
              <input
                type="number"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                className="w-full px-3 py-1.5 bg-black/30 border border-white/20 rounded-xl text-xs text-white outline-hidden focus:border-emerald-400"
              />
            </div>
            <button
              type="submit"
              disabled={savingIncomeSettings}
              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {savingIncomeSettings ? 'Saving...' : 'Update Goals'}
            </button>
          </form>
        </div>
      </div>

      {/* Section 2: Active Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Active Category Budgets ({budgets.length})
          </h3>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 py-16 px-4 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No budgets established yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Setting budgets for Food, Fuel, Shopping, and Entertainment prevents surprise credit card bills.
            </p>
            <button
              onClick={() => setIsAddBudgetOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Create First Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const status = evaluateBudget(b, currentMonthExpenses);
              return (
                <div
                  key={b.id}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                    status.isExceeded
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                      : status.isWarning
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {b.category === 'total_monthly' ? 'Total Monthly Budget' : b.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingBudget(b);
                            setCategory(b.category);
                            setMonthlyLimit(String(b.monthlyLimit));
                            setAlertThreshold(b.alertThreshold || 80);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                          title="Edit Budget"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBudgetToDelete(b)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          title="Delete Budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between mb-2">
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {formatCurrency(status.spent, currencySymbol)}
                      </div>
                      <div className="text-xs text-slate-400">
                        / {formatCurrency(b.monthlyLimit, currencySymbol)}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          status.isExceeded
                            ? 'bg-rose-500'
                            : status.isWarning
                            ? 'bg-amber-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, status.percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning / Alert Badge */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                    <span
                      className={`font-semibold ${
                        status.isExceeded
                          ? 'text-rose-600 dark:text-rose-400'
                          : status.isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {status.statusText}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {status.remaining >= 0
                        ? `Rem: ${formatCurrency(status.remaining, currencySymbol)}`
                        : `Over: ${formatCurrency(Math.abs(status.remaining), currencySymbol)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Budget Modal */}
      {(isAddBudgetOpen || editingBudget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              {editingBudget ? 'Edit Budget' : 'Create New Category Budget'}
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Budget Target Bucket
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
                >
                  <option value="total_monthly">Total Monthly Overall</option>
                  {DEFAULT_EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Monthly Limit ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Alert Warning Threshold ({alertThreshold}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value, 10))}
                  className="w-full"
                />
                <span className="text-[11px] text-slate-400">
                  Notify when spending reaches {alertThreshold}% of this budget.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBudgetOpen(false);
                    setEditingBudget(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!monthlyLimit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!budgetToDelete}
        title="Delete Budget"
        message={`Are you sure you want to remove the ${budgetToDelete?.category} budget? Your expenses will not be affected.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={async () => {
          if (budgetToDelete) {
            await removeBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }
        }}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
};
