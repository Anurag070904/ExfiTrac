import React, { useState } from 'react';
import { Plus, CheckSquare, Receipt, MessageCircle, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickActionFloatingButton: React.FC = () => {
  const { setQuickTaskOpen, setQuickExpenseOpen, setWhatsAppDrawerOpen } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40">
      {/* Speed Dial Menu items */}
      {open && (
        <div className="flex flex-col items-end gap-2.5 mb-3 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => {
              setOpen(false);
              setWhatsAppDrawerOpen(true);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xl transition-all"
          >
            <span>WhatsApp Bot Assistant</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
            </div>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              setQuickExpenseOpen(true);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xl transition-all"
          >
            <span>Quick Expense (&lt;10s)</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              setQuickTaskOpen(true);
            }}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xl transition-all"
          >
            <span>Create Task / Habit</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Main (+) Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 transition-transform active:scale-95"
        title="Quick Actions"
      >
        <Plus className={`w-7 h-7 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};
