import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  LineChart,
  Receipt,
  PieChart,
  PiggyBank,
  CreditCard,
  FileText,
  Bell,
  Settings,
  MessageCircle,
  Sparkles,
  Flame,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { currentStreak, setQuickTaskOpen, setQuickExpenseOpen, setWhatsAppDrawerOpen } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks & Habits', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'productivity-analytics', label: 'Productivity Analytics', icon: LineChart },
    { id: 'expenses', label: 'Expense Tracker', icon: Receipt },
    { id: 'finance-analytics', label: 'Finance Analytics', icon: PieChart },
    { id: 'budgets', label: 'Budgets & Savings', icon: PiggyBank },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'whatsapp-hub', label: 'WhatsApp Hub', icon: MessageCircle, badge: 'Live' },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-indigo-500/20">
            L
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block leading-none">
              LIFE<span className="text-indigo-600">OS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              Productivity & Finance
            </span>
          </div>
        </div>

        {/* Current streak badge */}
        {currentStreak > 0 && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 text-xs font-bold"
            title={`${currentStreak} Days Productive Streak!`}
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{currentStreak}d</span>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={() => setQuickTaskOpen(true)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-all border border-indigo-200/50 dark:border-indigo-800/50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Task</span>
        </button>
        <button
          onClick={() => setQuickExpenseOpen(true)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold transition-all border border-emerald-200/50 dark:border-emerald-800/50"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Expense</span>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Assistant banner */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setWhatsAppDrawerOpen(true)}
          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Bot
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            Automated 7 AM plan & 8 PM recap simulator ready.
          </p>
        </button>
      </div>
    </aside>
  );
};
