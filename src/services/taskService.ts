import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Task, TaskPriority, TaskRecurring, TaskStatus } from '../types';
import { getTodayDateString } from '../utils/constants';

const TASKS_COLLECTION = (userId: string) => collection(db, 'users', userId, 'tasks');

export async function createTask(userId: string, data: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  const taskData: Omit<Task, 'id'> = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    status: data.status || 'pending',
  };

  const docRef = await addDoc(TASKS_COLLECTION(userId), taskData);
  return docRef.id;
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
}

export async function toggleTaskComplete(userId: string, task: Task): Promise<void> {
  const isNowCompleted = task.status !== 'completed';
  const newStatus: TaskStatus = isNowCompleted ? 'completed' : 'pending';
  const completedAt = isNowCompleted ? new Date().toISOString() : null;

  await updateTask(userId, task.id, {
    status: newStatus,
    completedAt,
  });
}

export async function duplicateTask(userId: string, task: Task): Promise<string> {
  const now = new Date().toISOString();
  const newTask: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
    title: `${task.title} (Copy)`,
    description: task.description || '',
    date: getTodayDateString(),
    startTime: task.startTime,
    endTime: task.endTime,
    priority: task.priority,
    category: task.category,
    status: 'pending',
    recurring: 'none',
    reminder: task.reminder,
    reminderTime: task.reminderTime,
    isArchived: false,
  };
  return await createTask(userId, newTask);
}

export async function archiveTask(userId: string, taskId: string, archive = true): Promise<void> {
  await updateTask(userId, taskId, { isArchived: archive });
}

export function subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
  const q = query(TASKS_COLLECTION(userId), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...(doc.data() as Omit<Task, 'id'>) });
    });
    callback(tasks);
  }, (error) => {
    console.error('Error in subscribeToTasks:', error);
  });
}

/**
 * Parses natural language input into task details.
 * Example: "Complete 3 DSA questions at 7 PM"
 */
export function parseNaturalLanguageTask(input: string): {
  title: string;
  time?: string;
  priority?: TaskPriority;
  category?: string;
} {
  let text = input.trim();
  let time: string | undefined;
  let priority: TaskPriority = 'medium';
  let category = 'General';

  // Detect category keywords
  const lower = text.toLowerCase();
  if (lower.includes('dsa') || lower.includes('code') || lower.includes('bug') || lower.includes('github') || lower.includes('react') || lower.includes('api')) {
    category = 'Coding';
  } else if (lower.includes('study') || lower.includes('exam') || lower.includes('read') || lower.includes('chapter') || lower.includes('course') || lower.includes('learn')) {
    category = 'Study';
  } else if (lower.includes('gym') || lower.includes('workout') || lower.includes('run') || lower.includes('walk') || lower.includes('yoga') || lower.includes('fitness')) {
    category = 'Fitness';
  } else if (lower.includes('meeting') || lower.includes('client') || lower.includes('project') || lower.includes('email') || lower.includes('call') || lower.includes('work')) {
    category = 'Work';
  } else if (lower.includes('family') || lower.includes('mom') || lower.includes('dad') || lower.includes('kids') || lower.includes('doctor')) {
    category = 'Family';
  } else {
    category = 'Personal';
  }

  // Detect priority
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical')) {
    priority = 'urgent';
  } else if (lower.includes('important') || lower.includes('high priority')) {
    priority = 'high';
  } else if (lower.includes('low priority') || lower.includes('chill')) {
    priority = 'low';
  }

  // Detect time patterns: "at 7 PM", "at 19:00", "at 7:30 am", "at 8pm"
  const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = text.match(/(?:at|@)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? match[2].padStart(2, '0') : '00';
    const ampm = match[3]?.toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    time = `${String(hours).padStart(2, '0')}:${minutes}`;
    // Strip time fragment from title
    text = text.replace(match[0], '').trim();
  }

  // Clean trailing punctuation
  text = text.replace(/[,.-]+$/, '').trim();

  return {
    title: text || input,
    time,
    priority,
    category,
  };
}
