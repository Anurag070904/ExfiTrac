import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Receipt,
  Plus,
  X,
  Flame,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getTodayDateString } from '../utils/constants';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarPage: React.FC = () => {
  const { tasks, expenses, toggleTask, setQuickTaskOpen, setQuickExpenseOpen } = useApp();
  const { profile } = useAuth();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(getTodayDateString());
  };

  // Inspect selected day
  const selectedDayTasks = tasks.filter((t) => !t.isArchived && t.date === selectedDateStr);
  const selectedDayExpenses = expenses.filter((e) => !e.isArchived && e.date === selectedDateStr);
  const selectedDayCompletedTasks = selectedDayTasks.filter((t) => t.status === 'completed').length;
  const selectedDayTotalSpend = selectedDayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const selectedDayRate =
    selectedDayTasks.length > 0
      ? Math.round((selectedDayCompletedTasks / selectedDayTasks.length) * 100)
      : 0;

  // Calendar cells matrix
  const calendarCells = [];
  // Empty leading cells
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push(dStr);
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Schedule &amp; Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified chronological view of planned tasks, habits, and recorded expenses.
          </p>
        </div>

        {/* View Mode & Month Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs">
            <button
              onClick={prevMonth}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-2 text-slate-800 dark:text-slate-200 min-w-[110px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Grid & Day Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => (
              <div
                key={w}
                className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1"
              >
                {w}
              </div>
            ))}
          </div>

          {/* Month Day Tiles */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((dateStr, idx) => {
              if (!dateStr) {
                return (
                  <div
                    key={`empty_${idx}`}
                    className="h-20 sm:h-24 rounded-xl bg-slate-50/40 dark:bg-slate-950/20 border border-transparent"
                  />
                );
              }

              const dayNumber = parseInt(dateStr.split('-')[2], 10);
              const dayTasks = tasks.filter((t) => !t.isArchived && t.date === dateStr);
              const dayExpenses = expenses.filter((e) => !e.isArchived && e.date === dateStr);
              const dayTotalSpend = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

              const completedTasksCount = dayTasks.filter((t) => t.status === 'completed').length;
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === getTodayDateString();

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900'
                      : 'border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayTasks.length > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          completedTasksCount === dayTasks.length
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {completedTasksCount}/{dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayTotalSpend > 0 && (
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded truncate">
                        {formatCurrency(dayTotalSpend, profile?.currency || '₹')}
                      </div>
                    )}
                    {dayTasks.length > 0 && (
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                        {dayTasks[0].title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Activity Inspector (1 col) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Activity Inspector
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>{selectedDayTasks.length} tasks ({selectedDayRate}% done)</span>
              <span>•</span>
              <span>Spent {formatCurrency(selectedDayTotalSpend, profile?.currency || '₹')}</span>
            </div>
          </div>

          {/* Tasks for the selected day */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Tasks ({selectedDayTasks.length})</span>
                <button
                  onClick={() => setQuickTaskOpen(true)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 text-xs font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No tasks on this day.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <button
                          onClick={() => toggleTask(t)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            t.status === 'completed'
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {t.status === 'completed' && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span
                          className={`truncate font-medium ${
                            t.status === 'completed'
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      {t.startTime && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {t.startTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expenses for the selected day */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Expenses ({selectedDayExpenses.length})</span>
                <button
                  onClick={() => setQuickExpenseOpen(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 text-xs font-semibold"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>

              {selectedDayExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No expenses on this day.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedDayExpenses.map((e) => (
                    <div
                      key={e.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {e.description}
                        </p>
                        <span className="text-[10px] text-slate-400">{e.category}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">
                        {formatCurrency(e.amount, profile?.currency || '₹')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
