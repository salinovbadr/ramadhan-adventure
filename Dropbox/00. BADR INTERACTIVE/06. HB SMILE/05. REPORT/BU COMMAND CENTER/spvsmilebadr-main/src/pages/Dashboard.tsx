import { DollarSign, TrendingUp, Receipt, Target } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectTable } from '@/components/dashboard/ProjectTable';
import { FinancialChart } from '@/components/dashboard/FinancialChart';
import { SatisfactionPulse } from '@/components/dashboard/SatisfactionPulse';
import { LeadStats } from '@/components/dashboard/LeadStats';
import { TeamCapacityOverview } from '@/components/dashboard/TeamCapacityOverview';
import { TeamEsatTrend } from '@/components/dashboard/TeamEsatTrend';
import { ProjectResourceMap } from '@/components/dashboard/ProjectResourceMap';
import { useData } from '@/context/DataContext';
import { formatCurrency, TARGET_REVENUE } from '@/lib/mockData';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { projects, monthlyData, surveyData, leads, isLoading } = useData();

  // Calculate totals
  const latestMonth = monthlyData[monthlyData.length - 1];
  const totalRevenue = latestMonth?.revenue || 0;
  const totalOpex = monthlyData.reduce((sum, d) => sum + d.opex, 0);
  
  // Calculate average GP%
  const totalGP = projects.reduce((sum, p) => sum + (p.revenue - p.cogs), 0);
  const totalProjectRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
  const avgGPPercent = totalProjectRevenue > 0 ? ((totalGP / totalProjectRevenue) * 100).toFixed(1) : '0';

  // Latest survey scores
  const latestSurvey = surveyData[surveyData.length - 1];

  // Revenue vs Target percentage
  const revenueProgress = ((totalRevenue / TARGET_REVENUE) * 100).toFixed(0);

  // Pipeline value
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.estimatedValue * l.probability / 100), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Strategic Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of business performance</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Revenue vs Target"
          value={formatCurrency(totalRevenue)}
          subtitle={`${revenueProgress}% of ${formatCurrency(TARGET_REVENUE)} target`}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={{ value: 8.2, label: 'vs last month' }}
        />
        <StatCard
          title="Average Gross Profit"
          value={`${avgGPPercent}%`}
          subtitle="Across all projects"
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          trend={{ value: 2.4, label: 'improvement' }}
          variant="success"
        />
        <StatCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValue)}
          subtitle={`${activeLeads.length} active leads`}
          icon={<Target className="h-5 w-5 text-accent" />}
          trend={{ value: 12.5, label: 'vs last month' }}
        />
        <StatCard
          title="CSAT / ESAT"
          value={`${latestSurvey?.csat || 0}% / ${latestSurvey?.esat || 0}%`}
          subtitle="Latest survey results"
          icon={<Receipt className="h-5 w-5 text-warning" />}
          trend={{ value: 5.2, label: 'vs last quarter' }}
          variant="warning"
        />
      </div>

      {/* Project Table */}
      <ProjectTable />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FinancialChart />
        </div>
        <LeadStats />
      </div>

      {/* Satisfaction Pulse */}
      <SatisfactionPulse />

      {/* Team Section */}
      <TeamCapacityOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <TeamEsatTrend />
        <ProjectResourceMap />
      </div>
    </div>
  );
}
