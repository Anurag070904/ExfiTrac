import React, { useState, useEffect } from 'react';
import { Search, X, CheckSquare, Receipt, ArrowRight, Calendar, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/constants';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { tasks, expenses, subscriptions } = useApp();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setSearchTerm('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const query = searchTerm.toLowerCase().trim();

  const matchingTasks = query
    ? tasks.filter(
        (t) =>
          !t.isArchived &&
          (t.title.toLowerCase().includes(query) ||
            t.description?.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query))
      ).slice(0, 5)
    : [];

  const matchingExpenses = query
    ? expenses.filter(
        (e) =>
          !e.isArchived &&
          (e.description.toLowerCase().includes(query) ||
            e.category.toLowerCase().includes(query) ||
            e.notes?.toLowerCase().includes(query) ||
            e.paymentMethod.toLowerCase().includes(query))
      ).slice(0, 5)
    : [];

  const matchingSubs = query
    ? subscriptions.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query) ||
          s.notes?.toLowerCase().includes(query)
      ).slice(0, 3)
    : [];

  const totalResults = matchingTasks.length + matchingExpenses.length + matchingSubs.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, expenses, notes, categories (e.g., 'fuel', 'dsa', 'netflix')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-hidden text-base"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-5">
          {!query && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Type any keyword to search across LIFEOS</p>
              <p className="text-xs mt-1">Try searching for &quot;gym&quot;, &quot;fuel&quot;, &quot;rent&quot;, or &quot;coding&quot;</p>
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <p className="text-sm font-medium">No results found for &quot;{searchTerm}&quot;</p>
              <p className="text-xs mt-1">Check spelling or try a broader category keyword.</p>
            </div>
          )}

          {/* Tasks Results */}
          {matchingTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                  Tasks ({matchingTasks.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('tasks');
                  }}
                  className="hover:text-indigo-500 flex items-center gap-0.5 text-xs lowercase"
                >
                  view all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onNavigate('tasks');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          }`}
                        >
                          {t.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {t.title}
                        </h4>
                      </div>
                      {t.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-400 shrink-0 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Results */}
          {matchingExpenses.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                  Expenses ({matchingExpenses.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('expenses');
                  }}
                  className="hover:text-emerald-500 flex items-center gap-0.5 text-xs lowercase"
                >
                  view all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingExpenses.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onClose();
                      onNavigate('expenses');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          {e.category}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {e.description}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Tag className="w-3 h-3" />
                        <span>{e.paymentMethod}</span>
                        <span>•</span>
                        <span>{e.date}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(e.amount, profile?.currency || '₹')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions */}
          {matchingSubs.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
                <span>Subscriptions ({matchingSubs.length})</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('subscriptions');
                  }}
                  className="hover:text-indigo-500 flex items-center gap-0.5 text-xs lowercase"
                >
                  view all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {matchingSubs.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onNavigate('subscriptions');
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {s.serviceName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {s.billingCycle} • Next: {s.nextPaymentDate}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(s.amount, profile?.currency || '₹')}/{s.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
