import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, getCategoryColor } from '../utils/constants';

export const FinanceAnalyticsPage: React.FC = () => {
  const { expenses } = useApp();
  const { profile } = useAuth();

  const [dateWindow, setDateWindow] = useState<'30' | '90' | '180'>('30');
  const currencySymbol = profile?.currency || '₹';

  const activeExpenses = expenses.filter((e) => !e.isArchived);

  // 1. Category Breakdown for Donut Chart
  const categoryMap = new Map<string, number>();
  let totalAmount = 0;
  activeExpenses.forEach((e) => {
    categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
    totalAmount += e.amount;
  });

  const categoryPieData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
    color: getCategoryColor(name),
  }));

  // 2. Payment Method Breakdown for Pie Chart
  const paymentMap = new Map<string, number>();
  activeExpenses.forEach((e) => {
    paymentMap.set(e.paymentMethod, (paymentMap.get(e.paymentMethod) || 0) + e.amount);
  });

  const paymentMethodColors: Record<string, string> = {
    UPI: '#06b6d4',
    'Credit Card': '#8b5cf6',
    'Debit Card': '#3b82f6',
    Cash: '#10b981',
    'Bank Transfer': '#f59e0b',
    Other: '#94a3b8',
  };

  const paymentPieData = Array.from(paymentMap.entries()).map(([name, value]) => ({
    name,
    value,
    color: paymentMethodColors[name] || '#6366f1',
  }));

  // 3. Daily Spending Trend (Past N days)
  const daysNum = parseInt(dateWindow, 10);
  const dailySpendMap = new Map<string, number>();
  const today = new Date();

  for (let i = daysNum - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dailySpendMap.set(dateStr, 0);
  }

  activeExpenses.forEach((e) => {
    if (dailySpendMap.has(e.date)) {
      dailySpendMap.set(e.date, (dailySpendMap.get(e.date) || 0) + e.amount);
    }
  });

  const dailyTrendData = Array.from(dailySpendMap.entries()).map(([date, amount]) => ({
    date: date.substring(5), // MM-DD
    amount,
  }));

  // 4. Monthly Comparison (Current month, Prev month, 3-month average)
  const currentMonthStr = today.toISOString().substring(0, 7);
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);
  const twoMonthsAgoDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const twoMonthsAgoStr = twoMonthsAgoDate.toISOString().substring(0, 7);

  const currentMonthTotal = activeExpenses
    .filter((e) => e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthTotal = activeExpenses
    .filter((e) => e.date.startsWith(prevMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const twoMonthsAgoTotal = activeExpenses
    .filter((e) => e.date.startsWith(twoMonthsAgoStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const threeMonthAverage = Math.round(
    (currentMonthTotal + prevMonthTotal + twoMonthsAgoTotal) / 3
  );

  const monthlyComparisonData = [
    {
      month: '2 Months Ago',
      total: twoMonthsAgoTotal,
    },
    {
      month: 'Last Month',
      total: prevMonthTotal,
    },
    {
      month: 'Current Month',
      total: currentMonthTotal,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics &amp; Cash Flow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Categorized breakdown, payment distribution, and historical monthly comparisons.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs self-start sm:self-auto">
          {(['30', '90', '180'] as const).map((w) => (
            <button
              key={w}
              onClick={() => setDateWindow(w)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                dateWindow === w
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Last {w} Days
            </button>
          ))}
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Current Month Spend
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(currentMonthTotal, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-1">
            {prevMonthTotal > 0 && currentMonthTotal > prevMonthTotal ? (
              <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{Math.round(((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100)}% vs last month
              </span>
            ) : prevMonthTotal > 0 ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" />
                -{Math.round(((prevMonthTotal - currentMonthTotal) / prevMonthTotal) * 100)}% vs last month
              </span>
            ) : (
              <span className="text-slate-400">Baseline month</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Previous Month Total
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(prevMonthTotal, currencySymbol)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Full calendar cycle total</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            3-Month Moving Average
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(threeMonthAverage, currencySymbol)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Average monthly burn rate</span>
        </div>
      </div>

      {/* Main Charts: Category Breakdown & Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Where your capital flows across essential and discretionary buckets.
            </p>
          </div>

          {categoryPieData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        formatCurrency(Number(val) || 0, currencySymbol),
                        'Amount',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {categoryPieData.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-right shrink-0">
                      {formatCurrency(cat.value, currencySymbol)} ({cat.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Payment Methods
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across UPI, Cards, Bank Transfers, and Cash.
            </p>
          </div>

          {paymentPieData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        formatCurrency(Number(val) || 0, currencySymbol),
                        'Amount',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {paymentPieData.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(p.value, currencySymbol)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spending Line Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Daily Spending Timeline
          </h3>
          <p className="text-xs text-slate-400">
            Day-by-day cash outgo over the last {dateWindow} days.
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip
                formatter={(val: any) => [
                  formatCurrency(Number(val) || 0, currencySymbol),
                  'Spent',
                ]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#10b981' }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-Over-Month Comparison Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Month-Over-Month Comparison
          </h3>
          <p className="text-xs text-slate-400">
            Compare past two cycles against your active current month budget run-rate.
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip
                formatter={(val: any) => [
                  formatCurrency(Number(val) || 0, currencySymbol),
                  'Spending',
                ]}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
