'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { OrderSide, OrderType } from '@tradeforge/types';

export function OrderTicket({ 
  assetId, 
  symbol, 
  currentPrice,
  onClose
}: { 
  assetId: string;
  symbol: string;
  currentPrice: number;
  onClose?: () => void;
}) {
  const [side, setSide] = useState<OrderSide>(OrderSide.BUY);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post('/trade/order', {
        assetId,
        type: OrderType.MARKET,
        side,
        quantity: quantity.toString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setError(null);
      if (onClose) onClose();
    },
    onError: (err: any) => {
      setError(err.message || 'Order failed');
    }
  });

  const qtyNum = parseFloat(quantity) || 0;
  const estimatedCost = qtyNum * currentPrice;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          Trade <span className="text-emerald-400">{symbol}</span>
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            ✕
          </button>
        )}
      </div>

      <div className="flex bg-slate-950 p-1 rounded-lg mb-6 border border-slate-800">
        <button
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            side === OrderSide.BUY ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setSide(OrderSide.BUY)}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
            side === OrderSide.SELL ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setSide(OrderSide.SELL)}
        >
          Sell
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Order Type</label>
          <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 opacity-70 cursor-not-allowed">
            Market
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Quantity</label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono"
            placeholder="0.00"
          />
        </div>
        
        <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500 mb-1">Market Price</p>
            <p className="font-mono text-sm text-slate-300">{formatCurrency(currentPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Estimated {side === OrderSide.BUY ? 'Cost' : 'Credit'}</p>
            <p className="font-mono text-xl font-black text-white">{formatCurrency(estimatedCost)}</p>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <button
        onClick={() => orderMutation.mutate()}
        disabled={orderMutation.isPending || qtyNum <= 0}
        className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all disabled:opacity-50 ${
          side === OrderSide.BUY 
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' 
            : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
        }`}
      >
        {orderMutation.isPending ? 'Processing...' : `Submit ${side} Order`}
      </button>
    </div>
  );
}
