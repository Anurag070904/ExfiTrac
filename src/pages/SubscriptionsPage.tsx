import React, { useState } from 'react';
import {
  Plus,
  CreditCard,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BillingCycle, PaymentMethod, Subscription } from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  formatCurrency,
  getTodayDateString,
} from '../utils/constants';
import { calculateMonthlySubscriptionTotal } from '../services/subscriptionService';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const SubscriptionsPage: React.FC = () => {
  const { subscriptions, addNewSubscription, modifySubscription, removeSubscription } = useApp();
  const { profile } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);

  // Form states
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState(getTodayDateString());
  const [category, setCategory] = useState('Entertainment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    profile?.defaultPaymentMethod || 'Credit Card'
  );
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  const currencySymbol = profile?.currency || '₹';
  const monthlyTotal = calculateMonthlySubscriptionTotal(subscriptions);
  const yearlyTotal = monthlyTotal * 12;

  // Upcoming renewals (within next 7 days)
  const today = new Date();
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const sevenDaysStr = sevenDaysLater.toISOString().split('T')[0];
  const todayStr = getTodayDateString();

  const upcomingRenewals = subscriptions.filter(
    (s) => s.active && s.nextPaymentDate >= todayStr && s.nextPaymentDate <= sevenDaysStr
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!serviceName.trim() || isNaN(numAmount)) return;

    if (editingSub) {
      await modifySubscription(editingSub.id, {
        serviceName: serviceName.trim(),
        amount: numAmount,
        billingCycle,
        nextPaymentDate,
        category,
        paymentMethod,
        active,
        notes: notes.trim() || undefined,
      });
      setEditingSub(null);
    } else {
      await addNewSubscription({
        serviceName: serviceName.trim(),
        amount: numAmount,
        billingCycle,
        nextPaymentDate,
        category,
        paymentMethod,
        active,
        notes: notes.trim() || undefined,
      });
      setIsModalOpen(false);
    }

    setServiceName('');
    setAmount('');
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recurring Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit recurring SAAS, media, and memberships to stop zombie subscription leakages.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSub(null);
            setServiceName('');
            setAmount('');
            setNotes('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Monthly Commitment
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(Math.round(monthlyTotal), currencySymbol)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Normalized monthly recurring charge</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Annual Commitment
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(Math.round(yearlyTotal), currencySymbol)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Projected 12-month recurring cash out</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Active Subscriptions
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {subscriptions.filter((s) => s.active).length} / {subscriptions.length}
          </div>
          <p className="text-xs text-slate-400 mt-1">Currently billed services</p>
        </div>
      </div>

      {/* Upcoming Renewals Warning Strip */}
      {upcomingRenewals.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Upcoming Renewals Within 7 Days ({upcomingRenewals.length})
            </h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 truncate">
              {upcomingRenewals.map((u) => `${u.serviceName} (${formatCurrency(u.amount, currencySymbol)}) on ${u.nextPaymentDate}`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 py-16 px-4 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No subscriptions added yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Track Netflix, Spotify, gym memberships, and server subscriptions in one place.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Add First Subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                  !sub.active
                    ? 'opacity-60 border-slate-200 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {sub.serviceName}
                      </h4>
                      <span className="text-xs text-slate-400">{sub.category}</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={sub.active}
                        onChange={(e) => modifySubscription(sub.id, { active: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {formatCurrency(sub.amount, currencySymbol)}
                    <span className="text-xs font-normal text-slate-400">/{sub.billingCycle}</span>
                  </div>

                  <div className="space-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Next Renewal:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {sub.nextPaymentDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment Method:</span>
                      <span>{sub.paymentMethod}</span>
                    </div>
                  </div>

                  {sub.notes && (
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 italic">
                      {sub.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setEditingSub(sub);
                      setServiceName(sub.serviceName);
                      setAmount(String(sub.amount));
                      setBillingCycle(sub.billingCycle);
                      setNextPaymentDate(sub.nextPaymentDate);
                      setCategory(sub.category);
                      setPaymentMethod(sub.paymentMethod);
                      setNotes(sub.notes || '');
                      setActive(sub.active);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit Subscription"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSubToDelete(sub)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete Subscription"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isModalOpen || editingSub) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
              {editingSub ? 'Edit Subscription' : 'Add New Recurring Subscription'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Service / Provider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Spotify, AWS, GitHub..."
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Next Payment Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shared with roommates, annual discount..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSub(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!serviceName || !amount}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!subToDelete}
        title="Remove Subscription"
        message={`Are you sure you want to stop tracking "${subToDelete?.serviceName}"?`}
        confirmText="Remove"
        isDestructive={true}
        onConfirm={async () => {
          if (subToDelete) {
            await removeSubscription(subToDelete.id);
            setSubToDelete(null);
          }
        }}
        onCancel={() => setSubToDelete(null)}
      />
    </div>
  );
};
