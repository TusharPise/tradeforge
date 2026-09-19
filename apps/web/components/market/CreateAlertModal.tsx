'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AlertCondition } from '@tradeforge/types';
import { Bell, X, ArrowUpRight, ArrowDownRight, Loader2, Check } from 'lucide-react';

interface AssetTarget {
  id: string;
  symbol: string;
  name: string;
  currentPrice?: string | number | null;
}

interface CreateAlertModalProps {
  asset: AssetTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAlertModal({
  asset,
  isOpen,
  onClose,
}: CreateAlertModalProps) {
  const [condition, setCondition] = useState<AlertCondition>(AlertCondition.ABOVE);
  const [targetPrice, setTargetPrice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      if (!asset) throw new Error('No asset selected');
      if (!targetPrice || isNaN(Number(targetPrice)) || Number(targetPrice) <= 0) {
        throw new Error('Please enter a valid target price greater than 0');
      }

      return apiClient.post('/notifications/alerts', {
        assetId: asset.id,
        targetPrice: Number(targetPrice).toFixed(4),
        condition,
      });
    },
    onSuccess: () => {
      setIsSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['user-alerts'] });
      setTimeout(() => {
        setIsSuccess(false);
        setTargetPrice('');
        setErrorMessage('');
        onClose();
      }, 1200);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to create price alert');
    },
  });

  if (!isOpen || !asset) return null;

  const currentPriceNum = asset.currentPrice ? Number(asset.currentPrice) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Create Price Alert</h2>
            <p className="text-xs text-slate-400">Get notified when market ticks reach your target</p>
          </div>
        </div>

        {/* Asset Header Info */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-5 flex items-center justify-between">
          <div>
            <div className="font-bold text-white text-base">{asset.symbol}</div>
            <div className="text-xs text-slate-400 truncate max-w-[200px]">{asset.name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Current Price</div>
            <div className="text-base font-mono font-semibold text-emerald-400">
              ${currentPriceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
          </div>
        </div>

        {/* Condition Selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-300 mb-2">Trigger Condition</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setCondition(AlertCondition.ABOVE)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                condition === AlertCondition.ABOVE
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Crosses Above (≥)
            </button>
            <button
              type="button"
              onClick={() => setCondition(AlertCondition.BELOW)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                condition === AlertCondition.BELOW
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-400 shadow-sm'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Drops Below (≤)
            </button>
          </div>
        </div>

        {/* Target Price Input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">Target Price ($ USD)</label>
            {currentPriceNum > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTargetPrice((currentPriceNum * 1.05).toFixed(2))}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  +5%
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPrice((currentPriceNum * 0.95).toFixed(2))}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  -5%
                </button>
              </div>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            min="0.0001"
            placeholder={currentPriceNum > 0 ? currentPriceNum.toFixed(2) : '0.00'}
            value={targetPrice}
            onChange={(e) => {
              setTargetPrice(e.target.value);
              setErrorMessage('');
            }}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={createAlertMutation.isPending || isSuccess}
            onClick={() => createAlertMutation.mutate()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
              isSuccess
                ? 'bg-emerald-500 border border-emerald-400'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95'
            }`}
          >
            {createAlertMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Alert Set!
              </>
            ) : (
              'Set Price Alert'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
