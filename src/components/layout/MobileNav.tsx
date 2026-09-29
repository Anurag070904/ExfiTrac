import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Receipt,
  Menu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
}) => {
  const { setQuickTaskOpen, setQuickExpenseOpen } = useApp();
  const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Speed Dial Overlay */}
      {speedDialOpen && (
        <div
          onClick={() => setSpeedDialOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end pb-24 items-center gap-3 animate-in fade-in"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpeedDialOpen(false);
              setQuickTaskOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-xl hover:bg-indigo-700"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Add New Task</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSpeedDialOpen(false);
              setQuickExpenseOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white font-semibold text-sm shadow-xl hover:bg-emerald-700"
          >
            <Receipt className="w-4 h-4" />
            <span>Add Quick Expense (&lt;10s)</span>
          </button>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-colors ${
            currentPage === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('tasks')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-colors ${
            currentPage === 'tasks'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </button>

        {/* Center Floating Plus Button */}
        <div className="relative -top-4">
          <button
            onClick={() => setSpeedDialOpen(!speedDialOpen)}
            className="w-13 h-13 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
            title="Quick Action"
          >
            <Plus className={`w-6 h-6 transition-transform duration-200 ${speedDialOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>

        <button
          onClick={() => onNavigate('expenses')}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-colors ${
            currentPage === 'expenses'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>Expenses</span>
        </button>

        <button
          onClick={onOpenMobileMenu}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold py-1 px-3 rounded-xl transition-colors ${
            currentPage === 'more'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
