'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { formatCurrency } from '@/lib/utils';
import { AssetType } from '@tradeforge/types';
import { useState } from 'react';
import { OrderTicket } from '@/components/trade/OrderTicket';
import CreateAlertModal from '@/components/market/CreateAlertModal';
import { Bell, Trash2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function MarketsPage() {
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [alertAsset, setAlertAsset] = useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: prices, isLoading } = useQuery({
    queryKey: ['market-prices'],
    queryFn: async () => {
      const res = await apiClient.get('/market/prices');
      return res as any[];
    },
    refetchInterval: 3000,
  });

  const { data: assets } = useQuery({
    queryKey: ['market-assets'],
    queryFn: async () => {
      const res = await apiClient.get('/market/assets');
      return res as any[];
    }
  });

  const { data: userAlerts } = useQuery({
    queryKey: ['user-alerts'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications/alerts');
      return res as any[];
    },
    refetchInterval: 5000,
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-alerts'] });
    },
  });

  if (isLoading || !assets || !prices) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-slate-400 animate-pulse text-lg">Loading Market Data...</div>
      </div>
    );
  }

  // Combine static asset data with live pricing data
  const combinedData = assets.map(asset => {
    const livePrice = prices.find(p => p.symbol === asset.symbol);
    return { ...asset, ...livePrice };
  });

  const stocks = combinedData.filter(a => a.type === 'STOCK' || a.type === 'ETF');
  const crypto = combinedData.filter(a => a.type === 'CRYPTO');

  const renderGrid = (items: any[], title: string) => (
    <div className="mb-12">
      <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        {title}
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map(asset => {
          const isUp = asset.change24h >= 0;
          return (
            <div 
              key={asset.symbol} 
              onClick={() => setSelectedAsset(asset)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 hover:border-emerald-500/30 rounded-xl p-5 transition-all group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-200 text-lg group-hover:text-emerald-400 transition-colors">{asset.symbol}</h3>
                  <p className="text-xs text-slate-500 truncate max-w-[120px]">{asset.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAlertAsset(asset);
                      setIsAlertOpen(true);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                    title={`Set Price Alert for ${asset.symbol}`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {asset.type}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Live Price</p>
                  <p className="font-mono text-2xl font-black text-white tracking-tight">
                    {formatCurrency(asset.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isUp ? '+' : ''}{asset.percentChange24h}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Market Overview</h1>
          <p className="text-slate-400 mt-1">Real-time simulated order books & price triggers</p>
        </div>
      </div>

      {/* Active Price Alerts Drawer / Cards */}
      {userAlerts && userAlerts.length > 0 && (
        <div className="mb-10 bg-slate-900/60 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h2 className="font-semibold text-white text-sm">Your Active Price Alerts</h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {userAlerts.length}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {userAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  alert.isTriggered
                    ? 'bg-slate-950/40 border-slate-800 text-slate-500'
                    : 'bg-slate-950/80 border-slate-800/80 text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      alert.isTriggered
                        ? 'bg-slate-800 text-slate-500'
                        : alert.condition === 'ABOVE'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {alert.condition === 'ABOVE' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">{alert.asset?.symbol || 'Asset'}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {alert.condition === 'ABOVE' ? '≥' : '≤'} ${Number(alert.targetPrice).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {alert.isTriggered ? 'Triggered' : 'Monitoring'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAlertMutation.mutate(alert.id)}
                  className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                  title="Remove alert"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderGrid(stocks, "Equities & ETFs")}
      {renderGrid(crypto, "Cryptocurrencies")}

      {/* Order Ticket Modal Overlay */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedAsset(null)}></div>
          <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 duration-200">
            <OrderTicket 
              assetId={selectedAsset.id} 
              symbol={selectedAsset.symbol} 
              currentPrice={selectedAsset.price}
              onClose={() => setSelectedAsset(null)}
            />
          </div>
        </div>
      )}

      {/* Create Alert Modal Overlay */}
      <CreateAlertModal
        asset={alertAsset}
        isOpen={isAlertOpen}
        onClose={() => {
          setIsAlertOpen(false);
          setAlertAsset(null);
        }}
      />
    </div>
  );
}
