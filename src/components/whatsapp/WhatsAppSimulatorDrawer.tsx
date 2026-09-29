import React, { useState } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Bell,
  Sun,
  Moon,
  DollarSign,
  TrendingUp,
  CheckCheck,
  Shield,
  Phone,
  Settings,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationService } from '../../services/notificationService';

export const WhatsAppSimulatorDrawer: React.FC = () => {
  const {
    whatsAppDrawerOpen,
    setWhatsAppDrawerOpen,
    simulatedWhatsAppMessages,
    triggerWhatsAppMorningBriefing,
    triggerWhatsAppEveningReview,
    triggerWhatsAppExpenseReminder,
    triggerWhatsAppWeeklySummary,
  } = useApp();

  const { profile, updateProfileData } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [sendingAction, setSendingAction] = useState<string | null>(null);
  const [customMsg, setCustomMsg] = useState('');

  // Editable settings
  const [phone, setPhone] = useState(profile?.whatsappNumber || '+91 8767377234');
  const [enabled, setEnabled] = useState(profile?.whatsappNotifications?.enabled ?? true);
  const [morningTime, setMorningTime] = useState(profile?.whatsappNotifications?.morningTime || '07:00');
  const [eveningTime, setEveningTime] = useState(profile?.whatsappNotifications?.eveningTime || '20:00');
  const [savingSettings, setSavingSettings] = useState(false);

  if (!whatsAppDrawerOpen) return null;

  const handleAction = async (type: string, fn: () => Promise<void>) => {
    setSendingAction(type);
    try {
      await fn();
    } finally {
      setSendingAction(null);
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

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateProfileData({
        whatsappNumber: phone,
        whatsappNotifications: {
          ...(profile?.whatsappNotifications || {
            morningBriefing: true,
            eveningReview: true,
            expenseReminder: true,
            weeklyReport: true,
            monthlyReport: true,
          }),
          enabled,
          morningTime,
          eveningTime,
        },
      });
      setActiveTab('chat');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-100 dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] dark:bg-[#054640] text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-lg text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">LIFEOS Assistant</h3>
              <p className="text-xs text-emerald-200 flex items-center gap-1">
                <span>WhatsApp Bot</span> • <span>Active Simulator</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'chat' ? 'settings' : 'chat')}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${activeTab === 'settings' ? 'bg-white/20' : ''}`}
              title="Configure WhatsApp settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setWhatsAppDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Action Triggers Bar */}
        <div className="bg-[#128C7E] text-white px-3 py-2 text-xs flex items-center justify-between overflow-x-auto gap-2 border-b border-white/10 shrink-0">
          <span className="font-medium whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" /> Test Triggers:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              disabled={!!sendingAction}
              onClick={() => handleAction('morning', triggerWhatsAppMorningBriefing)}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Sun className="w-3 h-3 text-amber-300" /> Morning (7 AM)
            </button>
            <button
              disabled={!!sendingAction}
              onClick={() => handleAction('evening', triggerWhatsAppEveningReview)}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Moon className="w-3 h-3 text-indigo-200" /> Evening (8 PM)
            </button>
            <button
              disabled={!!sendingAction}
              onClick={() => handleAction('expense', triggerWhatsAppExpenseReminder)}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <DollarSign className="w-3 h-3 text-emerald-300" /> Expense
            </button>
            <button
              disabled={!!sendingAction}
              onClick={() => handleAction('weekly', triggerWhatsAppWeeklySummary)}
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded-md font-medium text-xs whitespace-nowrap transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <TrendingUp className="w-3 h-3 text-cyan-300" /> Weekly
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <>
            {/* WhatsApp Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#EFEAE2] dark:bg-[#0c1317]">
              {/* Encryption Banner */}
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-800 dark:text-amber-200/80 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg text-center max-w-xs mx-auto border border-amber-200/50 dark:border-amber-800/30">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>End-to-end simulated WhatsApp bridge to {phone}</span>
              </div>

              {simulatedWhatsAppMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                    No WhatsApp notifications yet
                  </h4>
                  <p className="text-xs mt-1 max-w-xs mx-auto">
                    Click any trigger button above to test instant notifications for morning plans, evening stats, or budget reminders.
                  </p>
                </div>
              ) : (
                simulatedWhatsAppMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col items-start max-w-[85%] mr-auto animate-in slide-in-from-bottom-2 duration-150">
                    <div className="bg-[#FFFFFF] dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-xs p-3.5 shadow-xs border border-black/5 dark:border-white/5">
                      <p className="text-xs font-semibold text-[#128C7E] dark:text-[#25D366] mb-1">
                        LIFEOS Assistant
                      </p>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed select-text font-normal">
                        {msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                        <span>{msg.timestamp}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulated Chat Input */}
            <form onSubmit={handleSendCustom} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Send a test message to WhatsApp bot..."
                className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden"
              />
              <button
                type="submit"
                disabled={!customMsg.trim()}
                className="p-2.5 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white disabled:opacity-50 transition-colors shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* Settings Panel */
          <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-slate-900 space-y-6">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                WhatsApp Notification Preferences
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your recipient phone number and scheduled alert times.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 8767377234"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format: +[Country Code][Number] (e.g. +91 for India, +1 for US)
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between cursor-pointer py-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                      Enable WhatsApp Notifications
                    </span>
                    <span className="text-xs text-slate-500">
                      Receive morning briefings and evening summaries
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Morning Briefing
                  </label>
                  <input
                    type="time"
                    value={morningTime}
                    onChange={(e) => setMorningTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Evening Review
                  </label>
                  <input
                    type="time"
                    value={eveningTime}
                    onChange={(e) => setEveningTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-semibold block flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" /> Modular Provider Architecture
                </span>
                <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                  LIFEOS supports Twilio WhatsApp API in production via <code className="bg-emerald-100 dark:bg-emerald-900 px-1 py-0.5 rounded">/api/whatsapp/send</code> with TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables, and automatically runs in zero-cost live simulation mode during development!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex-1 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white rounded-xl text-sm font-semibold shadow-xs disabled:opacity-50"
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
