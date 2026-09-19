'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';

function TickerTape() {
  const { data: prices } = useQuery({
    queryKey: ['market-prices'],
    queryFn: async () => {
      const res = await apiClient.get('/market/prices');
      return res as any[];
    },
    refetchInterval: 3000,
  });

  if (!prices || prices.length === 0) return null;

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800/50 overflow-hidden h-10 flex items-center relative">
      {/* Left fade */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
      {/* Right fade */}
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

      <div className="flex animate-marquee whitespace-nowrap">
        {[...prices, ...prices, ...prices].map((p, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-5 border-r border-slate-800/40 last:border-r-0">
            <span className="font-bold text-xs text-slate-400 tracking-wider">{p.symbol}</span>
            <span className="font-mono text-sm text-slate-100 font-semibold">{formatCurrency(p.price)}</span>
            <span className={`text-xs font-semibold font-mono px-1.5 py-0.5 rounded ${
              p.change24h >= 0 
                ? 'text-emerald-400 bg-emerald-400/10' 
                : 'text-red-400 bg-red-400/10'
            }`}>
              {p.change24h >= 0 ? '▲' : '▼'} {Math.abs(p.percentChange24h)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TickerTape;
