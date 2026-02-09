import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card',
    success: 'bg-success/5 border-success/20',
    warning: 'bg-warning/5 border-warning/20',
    danger: 'bg-destructive/5 border-destructive/20',
  };

  const trendColor = trend && trend.value >= 0 ? 'text-success' : 'text-destructive';

  return (
    <Card className={cn('p-6 card-shadow animate-fade-in', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn('text-xs font-medium', trendColor)}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      </div>
    </Card>
  );
}
