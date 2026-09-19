'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function LinkBankModal({ 
  isOpen, 
  onClose,
  isDismissible = true,
  onSuccess
}: { 
  isOpen: boolean; 
  onClose: () => void;
  isDismissible?: boolean;
  onSuccess?: () => void;
}) {
  const [bankName, setBankName] = useState('JPMorgan Chase');
  const [last4, setLast4] = useState('1234');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const [simulatedState, setSimulatedState] = useState<'idle' | 'connecting' | 'verifying'>('idle');

  const linkMutation = useMutation({
    mutationFn: async () => {
      setSimulatedState('connecting');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSimulatedState('verifying');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiClient.post('/finance/linked-accounts', { bankName, last4 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-accounts'] });
      setSimulatedState('idle');
      if (onSuccess) onSuccess();
      if (isDismissible) onClose();
    },
    onError: (err: any) => {
      setSimulatedState('idle');
      setError(err.message);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">
              {isDismissible ? 'Link Bank Account' : 'Mandatory: Link Funding Source'}
            </h2>
            {isDismissible && (
              <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
            )}
          </div>
          
          <p className="text-sm text-slate-400 mb-6">
            {isDismissible 
              ? 'Connect a simulated bank account to fund your paper trading portfolio.'
              : 'Before you can start paper trading, you need to securely connect a funding source.'}
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Bank Name (Mock)</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100"
              >
                <option value="JPMorgan Chase">JPMorgan Chase</option>
                <option value="Goldman Sachs">Goldman Sachs</option>
                <option value="Bank of America">Bank of America</option>
                <option value="Citibank">Citibank</option>
                <option value="Wells Fargo">Wells Fargo</option>
                <option value="Morgan Stanley">Morgan Stanley</option>
                <option value="HSBC">HSBC</option>
                <option value="Barclays">Barclays</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase">Account Last 4 Digits (Mock)</label>
              <input
                type="text" 
                maxLength={4}
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 font-mono"
                placeholder="1234"
              />
            </div>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <div className="pt-4 flex gap-3">
              {isDismissible && (
                <button 
                  onClick={onClose} 
                  disabled={linkMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => linkMutation.mutate()} 
                disabled={linkMutation.isPending || last4.length !== 4} 
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50 hover:bg-emerald-500 flex items-center justify-center gap-2"
              >
                {linkMutation.isPending && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {simulatedState === 'connecting' ? 'Connecting to Plaid...' 
                 : simulatedState === 'verifying' ? 'Verifying Routing...' 
                 : 'Securely Link Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
