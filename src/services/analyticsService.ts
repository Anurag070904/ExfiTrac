import { Budget, Expense, SmartInsight, Task } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/constants';

export interface DayMetric {
  date: string; // YYYY-MM-DD
  dayName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalExpenses: number;
  intensityLevel: 0 | 1 | 2 | 3 | 4; // 0=0%, 1=1-25%, 2=26-50%, 3=51-75%, 4=76-100%
}

export function calculateProductivityScore(todayTasks: Task[]): number {
  if (!todayTasks || todayTasks.length === 0) return 0;

  const total = todayTasks.length;
  const completed = todayTasks.filter((t) => t.status === 'completed').length;
  const rawRatio = completed / total;

  // Bonus for completing high or urgent tasks
  const urgentOrHighCompleted = todayTasks.filter(
    (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status === 'completed'
  ).length;

  const baseScore = rawRatio * 85;
  const priorityBonus = Math.min(15, urgentOrHighCompleted * 5);

  return Math.min(100, Math.round(baseScore + priorityBonus));
}

/**
 * Calculates continuous streak from task history.
 * A day counts towards streak if completion rate >= 50% or >= 1 task completed when planned.
 */
export function calculateStreak(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;

  const tasksByDate = new Map<string, { total: number; completed: number }>();
  tasks.forEach((t) => {
    if (!t.isArchived && t.date) {
      const current = tasksByDate.get(t.date) || { total: 0, completed: 0 };
      current.total += 1;
      if (t.status === 'completed') current.completed += 1;
      tasksByDate.set(t.date, current);
    }
  });

  const today = new Date();
  let streak = 0;
  let checkDate = new Date(today);

  // Check today first
  const todayStr = checkDate.toISOString().split('T')[0];
  const todayData = tasksByDate.get(todayStr);

  // If today has tasks and completed, streak includes today. If today has none or is in progress, check from yesterday
  if (todayData && todayData.completed > 0) {
    streak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday was completed
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Iterate backwards in time
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    const data = tasksByDate.get(dStr);

    if (data && (data.completed > 0 || data.total === 0)) {
      if (data.completed > 0) {
        streak += 1;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }

    // Safety guard
    if (streak > 365) break;
  }

  return streak;
}

/**
 * Generates day-by-day metrics for contribution heatmap
 */
export function generateHeatmapData(
  tasks: Task[],
  expenses: Expense[],
  daysCount = 180
): DayMetric[] {
  const result: DayMetric[] = [];
  const taskMap = new Map<string, { total: number; completed: number }>();
  const expenseMap = new Map<string, number>();

  tasks.forEach((t) => {
    if (!t.isArchived && t.date) {
      const val = taskMap.get(t.date) || { total: 0, completed: 0 };
      val.total += 1;
      if (t.status === 'completed') val.completed += 1;
      taskMap.set(t.date, val);
    }
  });

  expenses.forEach((e) => {
    if (!e.isArchived && e.date) {
      const val = expenseMap.get(e.date) || 0;
      expenseMap.set(e.date, val + e.amount);
    }
  });

  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const taskData = taskMap.get(dateStr) || { total: 0, completed: 0 };
    const expTotal = expenseMap.get(dateStr) || 0;

    const rate = taskData.total > 0 ? Math.round((taskData.completed / taskData.total) * 100) : 0;

    let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
    if (rate > 75) intensityLevel = 4;
    else if (rate > 50) intensityLevel = 3;
    else if (rate > 25) intensityLevel = 2;
    else if (rate > 0) intensityLevel = 1;

    result.push({
      date: dateStr,
      dayName,
      totalTasks: taskData.total,
      completedTasks: taskData.completed,
      completionRate: rate,
      totalExpenses: expTotal,
      intensityLevel,
    });
  }

  return result;
}

/**
 * Generates verified smart insights based on stored data
 */
export function generateSmartInsights(
  tasks: Task[],
  expenses: Expense[],
  budgets: Budget[],
  currencySymbol = '₹'
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const activeTasks = tasks.filter((t) => !t.isArchived);
  const activeExpenses = expenses.filter((e) => !e.isArchived);

  // 1. Weekday vs Weekend Productivity
  if (activeTasks.length >= 5) {
    let weekdayTotal = 0;
    let weekdayCompleted = 0;
    let weekendTotal = 0;
    let weekendCompleted = 0;

    activeTasks.forEach((t) => {
      const day = new Date(t.date).getDay();
      const isWeekend = day === 0 || day === 6;
      if (isWeekend) {
        weekendTotal++;
        if (t.status === 'completed') weekendCompleted++;
      } else {
        weekdayTotal++;
        if (t.status === 'completed') weekdayCompleted++;
      }
    });

    const weekdayRate = weekdayTotal > 0 ? Math.round((weekdayCompleted / weekdayTotal) * 100) : 0;
    const weekendRate = weekendTotal > 0 ? Math.round((weekendCompleted / weekendTotal) * 100) : 0;

    if (weekdayTotal > 0) {
      insights.push({
        id: 'ins_weekday_rate',
        type: 'productivity',
        title: 'Weekday Productivity Focus',
        description: `You complete ${weekdayRate}% of your tasks on weekdays (compared to ${weekendRate}% on weekends).`,
        iconName: 'Activity',
        trend: weekdayRate >= 70 ? 'up' : 'neutral',
        impact: 'positive',
      });
    }
  }

  // 2. Average Daily Food Spending
  const foodExpenses = activeExpenses.filter((e) => e.category.toLowerCase() === 'food');
  if (foodExpenses.length >= 3) {
    const totalFood = foodExpenses.reduce((sum, e) => sum + e.amount, 0);
    // Distinct days with food expense
    const uniqueDays = new Set(foodExpenses.map((e) => e.date)).size;
    const avgDailyFood = Math.round(totalFood / Math.max(1, uniqueDays));

    insights.push({
      id: 'ins_food_avg',
      type: 'expense',
      title: 'Food Expense Insight',
      description: `Your average daily food spending is ${formatCurrency(avgDailyFood, currencySymbol)} across ${uniqueDays} active days.`,
      iconName: 'Utensils',
      trend: avgDailyFood > 500 ? 'up' : 'neutral',
      impact: 'info',
    });
  }

  // 3. Month over Month Spending Trend
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthSpent = activeExpenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);
  const prevMonthSpent = activeExpenses
    .filter((e) => e.date.startsWith(prevMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  if (prevMonthSpent > 0 && currentMonthSpent > 0) {
    const diffPercent = Math.round(((currentMonthSpent - prevMonthSpent) / prevMonthSpent) * 100);
    if (diffPercent > 0) {
      insights.push({
        id: 'ins_mom_spent',
        type: 'expense',
        title: 'Monthly Spending Trajectory',
        description: `You have spent ${diffPercent}% more this month compared to the same period last month.`,
        iconName: 'TrendingUp',
        trend: 'up',
        impact: 'warning',
      });
    } else if (diffPercent < 0) {
      insights.push({
        id: 'ins_mom_spent_saved',
        type: 'expense',
        title: 'Spending Reduction',
        description: `Great job! Your spending is ${Math.abs(diffPercent)}% lower compared to last month.`,
        iconName: 'TrendingDown',
        trend: 'down',
        impact: 'positive',
      });
    }
  }

  // 4. Most Productive Day of the Week
  if (activeTasks.filter((t) => t.status === 'completed').length >= 5) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    activeTasks
      .filter((t) => t.status === 'completed')
      .forEach((t) => {
        const d = new Date(t.date).getDay();
        dayCounts[d]++;
      });

    let maxIndex = 1; // default Monday
    let maxVal = dayCounts[1];
    for (let i = 0; i < 7; i++) {
      if (dayCounts[i] > maxVal) {
        maxVal = dayCounts[i];
        maxIndex = i;
      }
    }

    insights.push({
      id: 'ins_most_productive_day',
      type: 'achievement',
      title: 'Power Day',
      description: `Your most productive day this month is ${dayNames[maxIndex]} with ${maxVal} tasks completed.`,
      iconName: 'Zap',
      trend: 'up',
      impact: 'positive',
    });
  }

  // If new user with low records, provide encouraging starter insight
  if (insights.length === 0) {
    insights.push({
      id: 'ins_starter',
      type: 'achievement',
      title: 'Welcome to LIFEOS',
      description: 'Start logging your daily tasks and expenses to unlock intelligent productivity and financial insights.',
      iconName: 'Sparkles',
      trend: 'neutral',
      impact: 'info',
    });
  }

  return insights;
}
