import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useData } from '@/context/DataContext';
import { formatCurrency, LEAD_STAGES } from '@/lib/mockData';
import { Target, TrendingUp, TrendingDown, ChevronDown, ChevronRight } from 'lucide-react';

export function LeadStats() {
  const { leads } = useData();
  const [expandedStages, setExpandedStages] = useState<string[]>([]);

  const toggleStage = (stageValue: string) => {
    setExpandedStages(prev => 
      prev.includes(stageValue) 
        ? prev.filter(s => s !== stageValue)
        : [...prev, stageValue]
    );
  };

  const wonLeads = leads.filter(l => l.stage === 'won');
  const lostLeads = leads.filter(l => l.stage === 'lost');
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  
  const totalPipelineValue = activeLeads.reduce((sum, l) => sum + (l.estimatedValue * l.probability / 100), 0);
  const totalWonValue = wonLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  const totalLostValue = lostLeads.reduce((sum, l) => sum + l.estimatedValue, 0);
  
  const winRate = wonLeads.length + lostLeads.length > 0 
    ? ((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100) 
    : 0;

  // Stage distribution with leads data
  const stageDistribution = LEAD_STAGES.filter(s => !['won', 'lost'].includes(s.value)).map(stage => ({
    ...stage,
    count: leads.filter(l => l.stage === stage.value).length,
    totalValue: leads.filter(l => l.stage === stage.value).reduce((sum, l) => sum + l.estimatedValue, 0),
    stageLeads: leads.filter(l => l.stage === stage.value),
  }));

  // Loss reason analysis
  const lossReasonStats = lostLeads.reduce((acc, lead) => {
    const reason = lead.lossReason || 'Tidak ada alasan';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLossReasons = Object.entries(lossReasonStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Lead Pipeline Overview</h3>
        <p className="text-sm text-muted-foreground">Status penawaran dan analisis konversi</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              Pipeline Value
            </div>
            <div className="text-lg font-bold">{formatCurrency(totalPipelineValue)}</div>
          </div>
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Win Rate
            </div>
            <div className="text-lg font-bold text-success">{winRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Pipeline Stages</h4>
          {stageDistribution.map(stage => {
            const stageKey = stage.value as string;
            const isExpanded = expandedStages.includes(stageKey);
            return (
              <Collapsible 
                key={stageKey} 
                open={isExpanded}
                onOpenChange={() => toggleStage(stageKey)}
              >
                <div className="space-y-1">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between text-sm hover:bg-muted/50 rounded-md p-1 -m-1 cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                        <span>{stage.label}</span>
                        <Badge variant="secondary" className="text-xs">{stage.count}</Badge>
                      </div>
                      <span className="font-medium">{formatCurrency(stage.totalValue)}</span>
                    </div>
                  </CollapsibleTrigger>
                  <Progress 
                    value={leads.length > 0 ? (stage.count / leads.length) * 100 : 0} 
                    className="h-1.5"
                  />
                </div>
                <CollapsibleContent className="mt-2">
                  {stage.stageLeads.length > 0 ? (
                    <div className="ml-6 space-y-1 border-l-2 border-muted pl-3">
                      {stage.stageLeads.map(lead => (
                        <div 
                          key={lead.id} 
                          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{lead.projectName}</span>
                            <span className="text-muted-foreground">{lead.companyName}</span>
                          </div>
                          <span className="text-muted-foreground">{formatCurrency(lead.estimatedValue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-6 text-xs text-muted-foreground italic pl-3">
                      Tidak ada lead di stage ini
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Won vs Lost */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-success mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">Won</span>
            </div>
            <div className="text-lg font-bold">{wonLeads.length}</div>
            <div className="text-xs text-muted-foreground">{formatCurrency(totalWonValue)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-destructive mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Lost</span>
            </div>
            <div className="text-lg font-bold">{lostLeads.length}</div>
            <div className="text-xs text-muted-foreground">{formatCurrency(totalLostValue)}</div>
          </div>
        </div>

        {/* Top Loss Reasons */}
        {topLossReasons.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Alasan Kekalahan</h4>
            <div className="space-y-2">
              {topLossReasons.map(([reason, count], index) => (
                <div key={reason} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{index + 1}. {reason}</span>
                  <Badge variant="outline" className="text-destructive">{count}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
