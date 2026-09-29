import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AppNotification, Expense, Task, UserProfile } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/constants';

const NOTIFICATIONS_COLLECTION = (userId: string) =>
  collection(db, 'users', userId, 'notifications');

export interface SimulatedWhatsAppMessage {
  id: string;
  recipient: string;
  sender: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'morning' | 'evening' | 'expense' | 'weekly' | 'custom';
}

// In-memory message store for local simulation sessions
let simulatedMessagesHistory: SimulatedWhatsAppMessage[] = [];
let simulatedMessageListeners: ((messages: SimulatedWhatsAppMessage[]) => void)[] = [];

export function subscribeToSimulatedWhatsApp(callback: (messages: SimulatedWhatsAppMessage[]) => void) {
  simulatedMessageListeners.push(callback);
  callback([...simulatedMessagesHistory]);
  return () => {
    simulatedMessageListeners = simulatedMessageListeners.filter((l) => l !== callback);
  };
}

function broadcastSimulatedMessages() {
  simulatedMessageListeners.forEach((l) => l([...simulatedMessagesHistory]));
}

export interface WhatsAppPayload {
  to: string;
  message: string;
  type: 'morning' | 'evening' | 'expense' | 'weekly' | 'custom';
}

export interface NotificationResult {
  success: boolean;
  provider: 'twilio' | 'simulator';
  messageId: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendMessage(payload: WhatsAppPayload): Promise<NotificationResult>;
}

class TwilioWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppPayload): Promise<NotificationResult> {
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        provider: 'twilio',
        messageId: data.sid || `msg_${Date.now()}`,
      };
    } catch (err: unknown) {
      console.warn('Twilio API request failed or not configured, falling back to simulator:', err);
      // Fallback to simulator
      return await new SimulatorWhatsAppProvider().sendMessage(payload);
    }
  }
}

class SimulatorWhatsAppProvider implements IWhatsAppProvider {
  async sendMessage(payload: WhatsAppPayload): Promise<NotificationResult> {
    const messageId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const msg: SimulatedWhatsAppMessage = {
      id: messageId,
      recipient: payload.to,
      sender: 'LIFEOS WhatsApp Bot (+1 415 523 8886)',
      content: payload.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      type: payload.type,
    };

    simulatedMessagesHistory = [msg, ...simulatedMessagesHistory].slice(0, 50);
    broadcastSimulatedMessages();

    return {
      success: true,
      provider: 'simulator',
      messageId,
    };
  }
}

export class NotificationService {
  private static provider: IWhatsAppProvider = new SimulatorWhatsAppProvider();

  public static setProvider(provider: IWhatsAppProvider) {
    this.provider = provider;
  }

  public static async sendWhatsApp(payload: WhatsAppPayload): Promise<NotificationResult> {
    return await this.provider.sendMessage(payload);
  }
}

// In-app Firestore notification management
export async function createInAppNotification(
  userId: string,
  notification: Omit<AppNotification, 'id' | 'userId' | 'createdAt' | 'read'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(NOTIFICATIONS_COLLECTION(userId), {
    ...notification,
    userId,
    read: false,
    createdAt: now,
  });
  return docRef.id;
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notifications', notificationId);
  await updateDoc(docRef, { read: true });
}

export async function markAllNotificationsAsRead(userId: string, notifications: AppNotification[]): Promise<void> {
  const batch = writeBatch(db);
  const unread = notifications.filter((n) => !n.read);
  unread.forEach((n) => {
    const ref = doc(db, 'users', userId, 'notifications', n.id);
    batch.update(ref, { read: true });
  });
  await batch.commit();
}

export async function deleteInAppNotification(userId: string, notificationId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notifications', notificationId);
  await deleteDoc(docRef);
}

export function subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
  const q = query(NOTIFICATIONS_COLLECTION(userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: AppNotification[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...(doc.data() as Omit<AppNotification, 'id'>) });
    });
    callback(list);
  }, (err) => console.error('Error in subscribeToNotifications:', err));
}

// Helper template generators
export function generateMorningMessage(userName: string, todayTasks: Task[]): string {
  const pendingCount = todayTasks.filter((t) => t.status !== 'completed').length;
  return `Good morning, ${userName}! 🌅\nYou have ${todayTasks.length} tasks planned for today (${pendingCount} pending).\nLet's make today productive and focused! 🚀`;
}

export function generateEveningMessage(todayTasks: Task[]): string {
  const completed = todayTasks.filter((t) => t.status === 'completed').length;
  const total = todayTasks.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const pending = total - completed;

  return `Daily Productivity Reminder 📊\n\nCompleted: ${completed}/${total}\nProgress: ${rate}%\nPending: ${pending}\n\nKeep going! Every step counts. 🔥`;
}

export function generateExpenseReminderMessage(): string {
  return `Expense Reminder 💰\n\nDon't forget to record today's expenses before calling it a day.\nTrack your wealth, build your freedom! ✨`;
}

export function generateWeeklyReportMessage(
  completedCount: number,
  completionRate: number,
  totalSpending: number,
  currencySymbol = '₹'
): string {
  return `Weekly Summary 📊\n\nTasks Completed: ${completedCount}\nCompletion Rate: ${completionRate}%\nTotal Spending: ${formatCurrency(totalSpending, currencySymbol)}\n\nKeep improving! 🚀`;
}
