import { Card } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Users, Heart } from 'lucide-react';

export function SatisfactionPulse() {
  const { surveyData } = useData();
  const latestSurvey = surveyData.length > 0 ? surveyData[surveyData.length - 1] : null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  const csatScore = latestSurvey?.csat ?? 0;
  const esatScore = latestSurvey?.esat ?? 0;

  return (
    <Card className="card-shadow animate-fade-in">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Employee & Customer Pulse</h3>
        <p className="text-sm text-muted-foreground">Latest satisfaction survey results</p>
      </div>
      <div className="p-6 space-y-6">
        {!latestSurvey ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada data survey.</p>
            <p className="text-sm">Tambahkan data CSAT/ESAT melalui Admin Panel.</p>
          </div>
        ) : (
          <>
            {/* CSAT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <Heart className="h-4 w-4 text-accent" />
                  </div>
                  <span className="font-medium">CSAT Score</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(csatScore)}`}>
                  {csatScore}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(csatScore)}`}
                  style={{ width: `${csatScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Customer Satisfaction Score</p>
            </div>

            {/* ESAT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <Users className="h-4 w-4 text-success" />
                  </div>
                  <span className="font-medium">ESAT Score</span>
                </div>
                <span className={`text-2xl font-bold ${getScoreColor(esatScore)}`}>
                  {esatScore}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(esatScore)}`}
                  style={{ width: `${esatScore}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Employee Satisfaction Score</p>
            </div>

            {/* Trend */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CSAT Trend (6mo)</p>
                  <p className="text-sm font-semibold text-success">+5.2%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">ESAT Trend (6mo)</p>
                  <p className="text-sm font-semibold text-success">+7.0%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
