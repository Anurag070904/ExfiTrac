import React, { useState } from 'react';
import {
  Bell,
  Check,
  Trash2,
  AlertTriangle,
  Receipt,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification, NotificationType } from '../types';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    readNotification,
    readAllNotifications,
    removeNotification,
    setWhatsAppDrawerOpen,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'budget_warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'expense_reminder':
        return <Receipt className="w-5 h-5 text-emerald-500" />;
      case 'overdue_task':
        return <Clock className="w-5 h-5 text-rose-500" />;
      case 'weekly_report':
        return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case 'whatsapp_simulated':
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>In-App Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            System alerts, scheduled habit reminders, and budget threshold warnings.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={readAllNotifications}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            onClick={() => setWhatsAppDrawerOpen(true)}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp Bot</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-x-auto">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'task_reminder', label: 'Task Reminders' },
          { id: 'budget_warning', label: 'Budget Warnings' },
          { id: 'expense_reminder', label: 'Expense Reminders' },
          { id: 'weekly_report', label: 'Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 py-16 px-4 text-center rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No notifications here
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You are completely caught up! We will alert you when budgets need attention or reminders fire.
            </p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                  : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 pr-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 shrink-0">
                  {getNotificationIcon(n.type)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 animate-pulse"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">
                    {n.message}
                  </p>

                  <span className="text-[11px] text-slate-400 mt-2 block">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!n.read && (
                  <button
                    onClick={() => readNotification(n.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => removeNotification(n.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
