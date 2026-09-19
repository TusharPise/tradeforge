'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ExpenseCategory } from '@tradeforge/types';

export function ExpenseFormModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.FOOD);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const { data: linkedAccounts } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => await apiClient.get('/finance/linked-accounts') as any[]
  });
  const defaultBank = linkedAccounts?.find((a: any) => a.isDefault);

  const expenseMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/finance/expense', {
        amount,
        category,
        description: description || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setAmount('');
      setDescription('');
      setError('');
      onClose();
    },
    onError: (err: any) => {
      setError(err.message);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Log Expense</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300">✕</button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
                placeholder="50.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                {Object.values(ExpenseCategory).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="e.g. Groceries"
                maxLength={255}
              />
            </div>
            
            {error && <p className="text-sm text-red-400 p-2 bg-red-500/10 rounded">{error}</p>}
            
            {defaultBank ? (
              <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Funding Source</p>
                  <p className="text-sm font-bold text-slate-200">{defaultBank.bankName} (•• {defaultBank.last4})</p>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                  Global Default
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
                You need to set a default bank in your Profile before logging expenses.
              </p>
            )}

            <div className="pt-2">
              <button
                onClick={() => expenseMutation.mutate()}
                disabled={expenseMutation.isPending || !amount || !defaultBank}
                className="w-full py-4 rounded-xl font-bold text-slate-100 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {expenseMutation.isPending ? 'Saving...' : 'Save Expense'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
