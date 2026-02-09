import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function TeamEsatTrend() {
  const { teamMembers, teamMemberEsat } = useData();

  // Get unique months and sort them
  const months = [...new Set(teamMemberEsat.map(e => e.month))].sort();

  // Build chart data
  const chartData = months.map(month => {
    const dataPoint: Record<string, string | number> = { month };
    
    teamMembers.filter(m => m.isActive).forEach(member => {
      const esatRecord = teamMemberEsat.find(
        e => e.teamMemberId === member.id && e.month === month
      );
      if (esatRecord) {
        dataPoint[member.name] = esatRecord.esatScore;
      }
    });
    
    return dataPoint;
  });

  // Calculate average ESAT per member
  const memberAverages = teamMembers
    .filter(m => m.isActive)
    .map(member => {
      const scores = teamMemberEsat.filter(e => e.teamMemberId === member.id);
      const avg = scores.length > 0 
        ? scores.reduce((sum, e) => sum + e.esatScore, 0) / scores.length 
        : 0;
      return { name: member.name, average: avg.toFixed(1) };
    })
    .filter(m => parseFloat(m.average) > 0);

  const activeMembers = teamMembers.filter(m => m.isActive);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend ESAT Tim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Belum ada data ESAT. Masukkan data di Admin → ESAT Tim.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trend ESAT Tim
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {activeMembers.map((member, index) => (
                <Line
                  key={member.id}
                  type="monotone"
                  dataKey={member.name}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Average scores */}
        {memberAverages.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Rata-rata ESAT:</p>
            <div className="flex flex-wrap gap-2">
              {memberAverages.map((m, index) => (
                <span 
                  key={m.name}
                  className="text-sm px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${COLORS[index % COLORS.length]}20`,
                    color: COLORS[index % COLORS.length]
                  }}
                >
                  {m.name}: {m.average}%
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
