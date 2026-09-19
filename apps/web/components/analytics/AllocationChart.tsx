'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = {
  CASH: '#3b82f6', // blue
  STOCK: '#10b981', // emerald
  CRYPTO: '#f59e0b', // amber
  ETF: '#8b5cf6', // violet
};

// Fallback palette for specific symbols if we have too many
const PALETTE = ['#06b6d4', '#ec4899', '#84cc16', '#ef4444', '#f97316'];

export function AllocationChart({ data }: { data: { name: string; value: number; type: string }[] }) {
  if (!data || data.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-slate-500">No allocation data</div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => {
              const color = COLORS[entry.type as keyof typeof COLORS] || PALETTE[index % PALETTE.length];
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
