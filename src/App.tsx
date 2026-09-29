import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickActionFloatingButton } from './components/layout/QuickActionFloatingButton';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { WhatsAppSimulatorDrawer } from './components/whatsapp/WhatsAppSimulatorDrawer';
import { QuickExpenseModal } from './components/dashboard/QuickExpenseModal';
import { QuickTaskModal } from './components/dashboard/QuickTaskModal';

// Pages
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { ProductivityAnalyticsPage } from './pages/ProductivityAnalyticsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { FinanceAnalyticsPage } from './pages/FinanceAnalyticsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { WhatsAppHubPage } from './pages/WhatsAppHubPage';
import { X, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const {
    quickTaskOpen,
    setQuickTaskOpen,
    quickExpenseOpen,
    setQuickExpenseOpen,
    searchModalOpen,
    setSearchModalOpen,
  } = useApp();

  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'light' ? false : window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-spin flex items-center justify-center font-black text-xl mb-4">
          L
        </div>
        <p className="text-sm font-semibold text-slate-300">Initializing LIFEOS for Anurag...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar Navigation */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTheme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12">
          {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentPage === 'tasks' && <TasksPage />}
          {currentPage === 'calendar' && <CalendarPage />}
          {currentPage === 'productivity-analytics' && <ProductivityAnalyticsPage />}
          {currentPage === 'expenses' && <ExpensesPage />}
          {currentPage === 'finance-analytics' && <FinanceAnalyticsPage />}
          {currentPage === 'budgets' && <BudgetsPage />}
          {currentPage === 'subscriptions' && <SubscriptionsPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'whatsapp-hub' && <WhatsAppHubPage />}
          {currentPage === 'notifications' && <NotificationsPage />}
          {currentPage === 'settings' && (
            <SettingsPage currentTheme={theme} onToggleTheme={toggleTheme} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Drawer Menu for "More" */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-white dark:bg-slate-900 h-full p-5 shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  All LIFEOS Modules
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  onClick={() => handleNavigate('calendar')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  📅 Calendar View
                </button>
                <button
                  onClick={() => handleNavigate('productivity-analytics')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  📈 Productivity Analytics &amp; Heatmap
                </button>
                <button
                  onClick={() => handleNavigate('finance-analytics')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  📊 Finance Analytics &amp; Breakdown
                </button>
                <button
                  onClick={() => handleNavigate('budgets')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  🎯 Budgets &amp; Savings Target
                </button>
                <button
                  onClick={() => handleNavigate('subscriptions')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  💳 Recurring Subscriptions
                </button>
                <button
                  onClick={() => handleNavigate('reports')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  📄 Reports &amp; CSV/JSON Exports
                </button>
                <button
                  onClick={() => handleNavigate('whatsapp-hub')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold"
                >
                  💬 WhatsApp Bot Automation Hub
                </button>
                <button
                  onClick={() => handleNavigate('notifications')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  🔔 Notifications
                </button>
                <button
                  onClick={() => handleNavigate('settings')}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  ⚙️ Settings &amp; Preferences
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
              LIFEOS v1.0 • Personal OS
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button for Desktop */}
      <QuickActionFloatingButton />

      {/* Interactive WhatsApp Simulator Drawer */}
      <WhatsAppSimulatorDrawer />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={quickExpenseOpen}
        onClose={() => setQuickExpenseOpen(false)}
      />

      {/* Quick Task Modal */}
      <QuickTaskModal
        isOpen={quickTaskOpen}
        onClose={() => setQuickTaskOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
