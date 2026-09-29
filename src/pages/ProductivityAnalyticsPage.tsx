import React, { useState } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Flame,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { generateHeatmapData } from '../services/analyticsService';
import { getCategoryColor } from '../utils/constants';

export const ProductivityAnalyticsPage: React.FC = () => {
  const { tasks, expenses, currentStreak, productivityScore } = useApp();
  const { profile } = useAuth();

  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [heatmapDays, setHeatmapDays] = useState<number>(120);

  const daysNum = parseInt(timeRange, 10);
  const heatmapData = generateHeatmapData(tasks, expenses, heatmapDays);

  // Daily completion data for Line chart
  const lineChartData = heatmapData.slice(-daysNum).map((d) => ({
    date: d.date.substring(5), // MM-DD
    rate: d.completionRate,
    completed: d.completedTasks,
    total: d.totalTasks,
  }));

  // Tasks completed vs planned Bar chart data
  const barChartData = heatmapData.slice(-14).map((d) => ({
    day: d.dayName,
    date: d.date.substring(5),
    Completed: d.completedTasks,
    Pending: Math.max(0, d.totalTasks - d.completedTasks),
  }));

  // Category distribution calculation
  const categoryCounts = new Map<string, number>();
  let totalCategorized = 0;
  tasks.filter((t) => !t.isArchived).forEach((t) => {
    categoryCounts.set(t.category, (categoryCounts.get(t.category) || 0) + 1);
    totalCategorized++;
  });

  const categoryPieData = Array.from(categoryCounts.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: totalCategorized > 0 ? Math.round((value / totalCategorized) * 100) : 0,
    color: getCategoryColor(name),
  }));

  // Heatmap intensity color mapping
  const getIntensityClass = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-600 hover:ring-2 hover:ring-emerald-400';
      case 3:
        return 'bg-emerald-500 hover:ring-2 hover:ring-emerald-300';
      case 2:
        return 'bg-emerald-400/80 hover:ring-2 hover:ring-emerald-200';
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/80 hover:ring-2 hover:ring-emerald-300';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Productivity Analytics &amp; Habits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real performance telemetry, completion consistency, and GitHub-style habit heatmap.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
          {(['7', '30', '90'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                timeRange === r
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Streak
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {currentStreak} Days
            </div>
            <p className="text-[11px] text-slate-500">Unbroken daily execution</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Productivity Score
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {productivityScore} / 100
            </div>
            <p className="text-[11px] text-slate-500">Weighted milestone grade</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              All-Time Tasks Finished
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {tasks.filter((t) => t.status === 'completed').length}
            </div>
            <p className="text-[11px] text-slate-500">Across all categories</p>
          </div>
        </div>
      </div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Productivity Contribution Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400">
              Intensity corresponds to daily task completion percentage.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-xs bg-slate-100 dark:bg-slate-800"></span>
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-200 dark:bg-emerald-950"></span>
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-400/80"></span>
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-500"></span>
              <span className="w-3.5 h-3.5 rounded-xs bg-emerald-600"></span>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
            {heatmapData.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.completedTasks}/${d.totalTasks} completed (${d.completionRate}%)`}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xs cursor-pointer transition-all ${getIntensityClass(
                  d.intensityLevel
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid: Completion Trend Line & Tasks Completed vs Pending Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Completion Rate */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Daily Completion Trend (%)
            </h3>
            <p className="text-xs text-slate-400">
              Task completion percentage over the last {timeRange} days.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0}%`, 'Completion Rate']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Completed vs Missed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Tasks Completed vs Pending (Past 14 Days)
            </h3>
            <p className="text-xs text-slate-400">
              Daily volume of finished vs pending items.
            </p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Donut Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Task Category Distribution
          </h3>
          <p className="text-xs text-slate-400">
            Share of focus across work, study, fitness, coding, and personal routines.
          </p>
        </div>

        {categoryPieData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No categorized tasks found. Create tasks with categories to populate analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val ?? 0} tasks`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {categoryPieData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-semibold text-slate-900 dark:text-white">{cat.name}</span>
                  </div>
                  <div className="font-mono text-slate-500 dark:text-slate-400">
                    {cat.value} tasks ({cat.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
