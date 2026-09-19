'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { PositionsTable } from '@/components/trade/PositionsTable';
import { EquityCurveChart } from '@/components/analytics/EquityCurveChart';
import { AllocationChart } from '@/components/analytics/AllocationChart';

// Modals
function DepositModal({ isOpen, onClose, accountId }: { isOpen: boolean; onClose: () => void; accountId: string; }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: linkedAccounts } = useQuery({
    queryKey: ['linked-accounts'],
    queryFn: async () => await apiClient.get('/finance/linked-accounts') as any[]
  });

  const depositMutation = useMutation({
    mutationFn: async (amt: string) => {
      return apiClient.post(`/accounts/${accountId}/deposit`, { 
        amount: amt
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-metrics'] });
      setAmount('');
      setError('');
      onClose();
    },
    onError: (err: any) => setError(err.message)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/10 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Deposit Funds</h2>
          <p className="text-sm text-slate-400 mb-6">Add simulated cash to your paper trading account.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Funding Source</label>
              {linkedAccounts?.find(a => a.isDefault) ? (
                <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      {linkedAccounts.find(a => a.isDefault).bankName} (•• {linkedAccounts.find(a => a.isDefault).last4})
                    </p>
                  </div>
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                    Global Default
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
                  You need to set a default bank in your Profile before depositing funds.
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Amount (USD)</label>
              <input
                type="number" step="0.01" min="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 font-mono"
                placeholder="10000.00"
              />
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <div className="flex gap-3 pt-4">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium">Cancel</button>
              <button 
                onClick={() => depositMutation.mutate(amount)} 
                disabled={depositMutation.isPending || !amount || !linkedAccounts?.find(a => a.isDefault)} 
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold disabled:opacity-50"
              >
                {depositMutation.isPending ? 'Depositing...' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ isOpen, onClose, accountId }: { isOpen: boolean; onClose: () => void; accountId: string; }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const withdrawMutation = useMutation({
    mutationFn: async (amt: string) => {
      return apiClient.post(`/accounts/${accountId}/withdraw`, { amount: amt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-metrics'] });
      setAmount('');
      setError('');
      onClose();
    },
    onError: (err: any) => setError(err.message)
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-red-500/10 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-100 mb-2">Withdraw Funds</h2>
          <div className="space-y-4">
            <input
              type="number" step="0.01" min="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 font-mono"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3 pt-4">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium">Cancel</button>
              <button onClick={() => withdrawMutation.mutate(amount)} disabled={withdrawMutation.isPending || !amount} className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-bold disabled:opacity-50">
                {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // Need accounts to get the account ID for the modals
  const { data: accounts, isLoading: isAccountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => await apiClient.get('/accounts') as any[]
  });

  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: async () => await apiClient.get('/analytics/metrics'),
    refetchInterval: 3000,
  });

  const { data: equityCurve, isLoading: isCurveLoading } = useQuery({
    queryKey: ['analytics-equity-curve'],
    queryFn: async () => await apiClient.get('/analytics/equity-curve') as any[],
  });

  if (isMetricsLoading || isCurveLoading || isAccountsLoading) {
    return <div className="text-slate-400 animate-pulse">Loading Analytics Dashboard...</div>;
  }

  const accountId = accounts?.[0]?.id;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 sm:mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Master Portfolio</h1>
          <p className="text-slate-400 mt-1">Real-time performance analytics</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {accountId && (
            <>
              <button onClick={() => setIsDepositOpen(true)} className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-bold rounded-lg transition-all active:scale-[0.96] shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 text-center">Deposit</button>
              <button onClick={() => setIsWithdrawOpen(true)} className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-lg transition-all border border-slate-700 active:scale-[0.96] text-center">Withdraw</button>
            </>
          )}
        </div>
      </div>

      {accountId && <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} accountId={accountId} />}
      {accountId && <WithdrawModal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} accountId={accountId} />}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-16 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-indigo-500/10"></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total Value</p>
          <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(metrics?.totalValue || 0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
          <div className={`absolute top-0 right-0 p-16 rounded-full blur-2xl -mr-8 -mt-8 transition-all ${(metrics?.unrealizedPnL || 0) >= 0 ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-red-500/5 group-hover:bg-red-500/10'}`}></div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Unrealized P&L</p>
          <p className={`text-3xl font-black tracking-tight ${(metrics?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(metrics?.unrealizedPnL || 0) >= 0 ? '+' : ''}{formatCurrency(metrics?.unrealizedPnL || 0)}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Cash Available</p>
          <p className="text-3xl font-black text-white tracking-tight">{formatCurrency(metrics?.cash || 0)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Win Rate (Approx)</p>
          <p className="text-3xl font-black text-white tracking-tight">{metrics?.winRate || 0}%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equity Curve */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-6">30-Day Equity Curve</h2>
          <EquityCurveChart data={equityCurve || []} />
        </div>

        {/* Asset Allocation */}
        <div className="col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-6">Asset Allocation</h2>
          <AllocationChart data={metrics?.allocation || []} />
        </div>
      </div>

      {/* Positions Table (Re-used) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Open Positions</h2>
        <PositionsTable />
      </div>

    </div>
  );
}
