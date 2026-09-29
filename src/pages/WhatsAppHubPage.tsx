import React, { useState } from 'react';
import {
  MessageCircle,
  Sun,
  Moon,
  DollarSign,
  TrendingUp,
  Send,
  CheckCheck,
  Shield,
  Smartphone,
  PhoneCall,
  Sparkles,
  RefreshCw,
  Bell,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { NotificationService } from '../services/notificationService';

export const WhatsAppHubPage: React.FC = () => {
  const {
    simulatedWhatsAppMessages,
    triggerWhatsAppMorningBriefing,
    triggerWhatsAppEveningReview,
    triggerWhatsAppExpenseReminder,
    triggerWhatsAppWeeklySummary,
  } = useApp();

  const { profile, updateProfileData } = useAuth();

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState('');
  const [phone, setPhone] = useState(profile?.whatsappNumber || '+91 8767377234');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const handleAction = async (type: string, fn: () => Promise<void>) => {
    setActiveAction(type);
    try {
      await fn();
    } finally {
      setActiveAction(null);
    }
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    await NotificationService.sendWhatsApp({
      to: profile?.whatsappNumber || phone,
      message: customMsg.trim(),
      type: 'custom',
    });
    setCustomMsg('');
  };

  const handleSavePhone = async () => {
    setIsUpdatingPhone(true);
    try {
      await updateProfileData({ whatsappNumber: phone });
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-[#128C7E] fill-[#128C7E]" />
            <span>WhatsApp Automation &amp; Notification Hub</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Autonomous daily briefings, evening productivity recaps, and weekly financial statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Simulated Webhook Active
          </span>
        </div>
      </div>

      {/* Main Grid: Control Center & Mobile Preview Phone Frame */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Automation Triggers & Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Phone Configuration Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Registered WhatsApp Recipient</span>
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 8767377234"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono outline-hidden"
              />
              <button
                onClick={handleSavePhone}
                disabled={isUpdatingPhone}
                className="px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isUpdatingPhone ? 'Saving...' : 'Update'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Notifications are directed to this number. Works seamlessly with Twilio WhatsApp API or developer preview simulator.
            </p>
          </div>

          {/* Trigger Cards */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Simulate Real-Time Trigger Events</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger 1: Morning Briefing */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" /> Morning Briefing (7 AM)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">07:00 AM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Greets user, counts today&apos;s planned tasks, highlights top priority items.
                  </p>
                </div>
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction('morning', triggerWhatsAppMorningBriefing)}
                  className="mt-3 w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {activeAction === 'morning' ? 'Dispatching...' : 'Trigger Morning Plan Now'}
                </button>
              </div>

              {/* Trigger 2: Evening Review */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-400" /> Daily Productivity Review
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">08:00 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Computes completed vs pending tasks, daily % score, and streak motivation.
                  </p>
                </div>
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction('evening', triggerWhatsAppEveningReview)}
                  className="mt-3 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {activeAction === 'evening' ? 'Dispatching...' : 'Trigger 8 PM Recap Now'}
                </button>
              </div>

              {/* Trigger 3: Expense Reminder */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Expense Check-In
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">09:30 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Prompts user to log any unrecorded cash or UPI transactions before sleep.
                  </p>
                </div>
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction('expense', triggerWhatsAppExpenseReminder)}
                  className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {activeAction === 'expense' ? 'Dispatching...' : 'Trigger Expense Reminder'}
                </button>
              </div>

              {/* Trigger 4: Weekly Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 bg-slate-50/50 dark:bg-slate-800/30 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-cyan-500" /> Weekly Executive Summary
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Sunday 8 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    Synthesizes completed tasks volume, 7-day rate %, and weekly expense burn.
                  </p>
                </div>
                <button
                  disabled={!!activeAction}
                  onClick={() => handleAction('weekly', triggerWhatsAppWeeklySummary)}
                  className="mt-3 w-full py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {activeAction === 'weekly' ? 'Dispatching...' : 'Trigger Weekly Summary'}
                </button>
              </div>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4" /> Production Architecture
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              In production, the notification service routes via <code className="text-emerald-300 bg-white/10 px-1 py-0.5 rounded">/api/whatsapp/send</code>. For prototyping without paid telecom credentials, the built-in development simulation engine stores live delivery states and formats realistic WhatsApp message logs!
            </p>
          </div>
        </div>

        {/* Right Column: Realistic WhatsApp Phone Mockup (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#111b21] rounded-3xl p-3 shadow-2xl border-4 border-slate-800 max-w-sm mx-auto flex flex-col h-[650px] overflow-hidden">
            {/* Phone Screen WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3.5 rounded-t-2xl flex items-center justify-between shadow-md shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-xs">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-none">LIFEOS Bot</h4>
                  <span className="text-[10px] text-emerald-200">Online • Automated</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-mono">
                WhatsApp
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#efeae2] dark:bg-[#0b141a]">
              <div className="flex items-center justify-center text-[10px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg text-center border border-amber-200/40">
                🔒 Messages are generated via LIFEOS Notification Engine to {phone}
              </div>

              {simulatedWhatsAppMessages.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-500" />
                  <p className="font-semibold text-slate-600 dark:text-slate-400">
                    No messages yet
                  </p>
                  <p className="text-[11px] mt-1 text-slate-400">
                    Click any trigger button on the left to test live notifications!
                  </p>
                </div>
              ) : (
                simulatedWhatsAppMessages.map((msg) => (
                  <div key={msg.id} className="max-w-[90%] mr-auto animate-in slide-in-from-bottom-2">
                    <div className="bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tl-xs shadow-xs text-xs">
                      <p className="font-semibold text-[10px] text-[#128C7E] dark:text-[#25D366] mb-1">
                        LIFEOS Assistant
                      </p>
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-normal">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Chat Input */}
            <form onSubmit={handleSendCustom} className="p-2 bg-white dark:bg-[#202c33] border-t border-slate-200 dark:border-slate-700/80 rounded-b-2xl flex items-center gap-1.5 shrink-0">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type test message..."
                className="flex-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
              />
              <button
                type="submit"
                disabled={!customMsg.trim()}
                className="p-2 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-full disabled:opacity-40 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
