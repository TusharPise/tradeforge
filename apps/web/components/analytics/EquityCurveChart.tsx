'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function EquityCurveChart({ data }: { data: { date: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[400px] flex items-center justify-center text-slate-500">No data available</div>;
  }

  // Calculate the min and max to make the chart look dynamic, rather than starting from 0
  const values = data.map(d => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1;
  const domain = [Math.max(0, min - padding), max + padding];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#64748b' }}
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            domain={domain}
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
            width={60}
          />
          <Tooltip 
            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            animationDuration={1500}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
