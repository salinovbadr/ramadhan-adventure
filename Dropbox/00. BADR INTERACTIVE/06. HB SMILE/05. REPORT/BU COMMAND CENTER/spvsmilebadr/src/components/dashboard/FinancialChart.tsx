import { Card } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

export function FinancialChart() {
  const { monthlyData } = useData();

  const chartData = monthlyData.map((d) => ({
    name: `${d.month} ${d.year}`,
    Revenue: d.revenue / 1000000000,
    OPEX: d.opex / 1000000000,
  }));

  return (
    <Card className="card-shadow animate-fade-in">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Financial Trends</h3>
        <p className="text-sm text-muted-foreground">Monthly revenue vs operational expenses (in Billion Rp)</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOpex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }} 
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              className="text-muted-foreground"
              tickFormatter={(value) => `${value}B`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`Rp ${value.toFixed(2)}B`, undefined]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="OPEX"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOpex)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
