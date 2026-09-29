import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Globe,
  Bell,
  MessageCircle,
  CreditCard,
  Tag,
  Shield,
  Save,
  Check,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { PAYMENT_METHODS } from '../utils/constants';

interface SettingsPageProps {
  currentTheme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentTheme, onToggleTheme }) => {
  const { profile, updateProfileData } = useAuth();
  const { setWhatsAppDrawerOpen } = useApp();

  const [displayName, setDisplayName] = useState(profile?.displayName || 'Anurag');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '+91 8767377234');
  const [currency, setCurrency] = useState(profile?.currency || '₹');
  const [currencyCode, setCurrencyCode] = useState(profile?.currencyCode || 'INR');
  const [timezone, setTimezone] = useState(profile?.timezone || 'Asia/Kolkata');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<PaymentMethod>(
    profile?.defaultPaymentMethod || 'UPI'
  );

  // Custom Categories
  const [newCatName, setNewCatName] = useState('');
  const [taskCategories, setTaskCategories] = useState<string[]>(
    profile?.customTaskCategories || []
  );
  const [newExpenseCatName, setNewExpenseCatName] = useState('');
  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    profile?.customExpenseCategories || []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currencyOptions = [
    { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
    { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
    { symbol: '€', code: 'EUR', label: 'Euro (€)' },
    { symbol: '£', code: 'GBP', label: 'British Pound (£)' },
    { symbol: '¥', code: 'JPY', label: 'Japanese Yen (¥)' },
    { symbol: 'C$', code: 'CAD', label: 'Canadian Dollar (C$)' },
    { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$)' },
  ];

  const handleCurrencyChange = (sym: string) => {
    const opt = currencyOptions.find((o) => o.symbol === sym);
    setCurrency(sym);
    if (opt) setCurrencyCode(opt.code);
  };

  const handleAddCustomTaskCat = () => {
    if (newCatName.trim() && !taskCategories.includes(newCatName.trim())) {
      setTaskCategories([...taskCategories, newCatName.trim()]);
      setNewCatName('');
    }
  };

  const handleRemoveTaskCat = (cat: string) => {
    setTaskCategories(taskCategories.filter((c) => c !== cat));
  };

  const handleAddCustomExpenseCat = () => {
    if (newExpenseCatName.trim() && !expenseCategories.includes(newExpenseCatName.trim())) {
      setExpenseCategories([...expenseCategories, newExpenseCatName.trim()]);
      setNewExpenseCatName('');
    }
  };

  const handleRemoveExpenseCat = (cat: string) => {
    setExpenseCategories(expenseCategories.filter((c) => c !== cat));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfileData({
        displayName: 'Anurag',
        whatsappNumber: whatsappNumber.trim() || '+91 8767377234',
        currency,
        currencyCode,
        timezone,
        defaultPaymentMethod,
        customTaskCategories: taskCategories,
        customExpenseCategories: expenseCategories,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System &amp; User Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize currency, timezone, WhatsApp bot integration, and default payment habits.
        </p>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">User Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || 'user@example.com'}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 outline-hidden cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Currency &amp; Regional Localization
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt.code} value={opt.symbol}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp & Bot Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#128C7E]" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                WhatsApp Assistant Integration
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setWhatsAppDrawerOpen(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Open Live Simulator &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+91 8767377234"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Default Payment Method
              </label>
              <select
                value={defaultPaymentMethod}
                onChange={(e) => setDefaultPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Custom Task Categories */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Tag className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Task Categories Manager
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add new category (e.g. Reading, Side Project)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddCustomTaskCat}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {taskCategories.map((c) => (
              <span
                key={c}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTaskCat(c)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Preferences saved successfully to database!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
