'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

export function PositionsTable() {
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const res = await apiClient.get('/trade/positions');
      return res as any[];
    }
  });

  const { data: prices } = useQuery({
    queryKey: ['market-prices'],
    queryFn: async () => {
      const res = await apiClient.get('/market/prices');
      return res as any[];
    },
    refetchInterval: 3000,
  });

  const enrichedPositions = useMemo(() => {
    if (!positions || !prices) return [];
    
    return positions.map(pos => {
      const liveData = prices.find(p => p.symbol === pos.asset.symbol);
      const currentPrice = liveData ? liveData.price : pos.asset.currentPrice;
      
      const qty = parseFloat(pos.quantity);
      const avgCost = parseFloat(pos.averageCost);
      const marketValue = qty * currentPrice;
      const costBasis = qty * avgCost;
      const unrealizedPnL = marketValue - costBasis;
      const unrealizedPnLPercent = (unrealizedPnL / costBasis) * 100;
      
      return {
        ...pos,
        currentPrice,
        marketValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    });
  }, [positions, prices]);

  if (isLoading) {
    return <div className="text-slate-400 animate-pulse">Loading positions...</div>;
  }

  if (enrichedPositions.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">No Active Positions</h3>
        <p className="text-slate-400">Head over to the Markets tab to start trading.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-100">Open Positions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Asset</th>
              <th className="px-6 py-4 text-right">Quantity</th>
              <th className="px-6 py-4 text-right">Avg Cost</th>
              <th className="px-6 py-4 text-right">Current Price</th>
              <th className="px-6 py-4 text-right">Market Value</th>
              <th className="px-6 py-4 text-right">Unrealized P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {enrichedPositions.map((pos) => {
              const isProfit = pos.unrealizedPnL >= 0;
              return (
                <tr key={pos.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                        {pos.asset.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{pos.asset.symbol}</div>
                        <div className="text-xs text-slate-500">{pos.asset.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-300">
                    {parseFloat(pos.quantity).toFixed(4)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm text-slate-300">
                    {formatCurrency(pos.averageCost)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-white">
                    {formatCurrency(pos.currentPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-sm font-bold text-slate-200">
                    {formatCurrency(pos.marketValue)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}{formatCurrency(pos.unrealizedPnL)}
                    </div>
                    <div className={`font-mono text-xs ${isProfit ? 'text-emerald-500/80' : 'text-red-500/80'}`}>
                      {isProfit ? '+' : ''}{pos.unrealizedPnLPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
