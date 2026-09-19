'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { ExpenseFormModal } from '@/components/finance/ExpenseFormModal';
import { ExpenseCategoryChart, ExpenseTrendChart } from '@/components/finance/ExpenseCharts';

export default function FinancePage() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/summary');
      return res;
    }
  });

  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await apiClient.get('/finance/expenses');
      return res as any[];
    }
  });



  // Hardcoded budget for Phase 5
  const MONTHLY_BUDGET = 5000;
  const totalSpent = summary?.totalSpent || 0;
  const budgetPercentage = Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100);
  
  // Determine progress bar color based on percentage
  let progressColor = 'bg-emerald-500';
  if (budgetPercentage > 75) progressColor = 'bg-amber-500';
  if (budgetPercentage > 90) progressColor = 'bg-red-500';

  if (isSummaryLoading || isExpensesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 animate-pulse text-lg">Loading Finance Data...</div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      <ExpenseFormModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
      />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Personal Finance</h1>
          <p className="text-slate-400 mt-2">Track expenses, manage budget, and link funding sources</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.96] hover:shadow-indigo-500/30 text-center"
          >
            + Log Expense
          </button>
        </div>
      </div>

      {/* Budget Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <h2 className="text-lg font-bold text-slate-200 mb-6">Monthly Budget Overview</h2>
        
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-4xl font-black text-white tracking-tight">{formatCurrency(totalSpent)}</p>
            <p className="text-sm text-slate-400 mt-1">Spent this month</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-300">{formatCurrency(MONTHLY_BUDGET)}</p>
            <p className="text-sm text-slate-500">Monthly Budget</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-4 mt-4 border border-slate-800 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`} 
            style={{ width: `${budgetPercentage}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-slate-500 mt-2 font-mono">{budgetPercentage.toFixed(1)}% Used</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Spending by Category</h2>
          <ExpenseCategoryChart data={summary?.categoryData || []} />
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-200 mb-4">6-Month Trend</h2>
          <ExpenseTrendChart data={summary?.monthlyTrend || []} />
        </div>
      </div>



      {/* Recent Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Recent Expenses</h3>
        </div>
        
        {(!expenses || expenses.length === 0) ? (
          <div className="p-12 text-center text-slate-500">
            No expenses logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 ${
                        exp.category === 'FOOD' ? 'bg-orange-500/10 text-orange-400' :
                        exp.category === 'HOUSING' ? 'bg-blue-500/10 text-blue-400' :
                        exp.category === 'TRANSPORTATION' ? 'bg-purple-500/10 text-purple-400' :
                        exp.category === 'ENTERTAINMENT' ? 'bg-pink-500/10 text-pink-400' :
                        exp.category === 'HEALTHCARE' ? 'bg-red-500/10 text-red-400' :
                        exp.category === 'INVESTMENTS' ? 'bg-emerald-500/10 text-emerald-400' :
                        exp.category === 'EDUCATION' ? 'bg-cyan-500/10 text-cyan-400' :
                        exp.category === 'UTILITIES' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          exp.category === 'FOOD' ? 'bg-orange-400' :
                          exp.category === 'HOUSING' ? 'bg-blue-400' :
                          exp.category === 'TRANSPORTATION' ? 'bg-purple-400' :
                          exp.category === 'ENTERTAINMENT' ? 'bg-pink-400' :
                          exp.category === 'HEALTHCARE' ? 'bg-red-400' :
                          exp.category === 'INVESTMENTS' ? 'bg-emerald-400' :
                          exp.category === 'EDUCATION' ? 'bg-cyan-400' :
                          exp.category === 'UTILITIES' ? 'bg-yellow-400' :
                          'bg-slate-400'
                        }`}></span>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 truncate max-w-xs">
                      {exp.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-100">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
