import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useData } from '@/context/DataContext';
import { LEAD_STAGES } from '@/lib/mockData';
import { History, ArrowRight, User } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LeadHistoryViewProps {
  leadId: string;
}

export function LeadHistoryView({ leadId }: LeadHistoryViewProps) {
  const { leadHistory, leads } = useData();
  const lead = leads.find(l => l.id === leadId);
  const history = leadHistory.filter(h => h.leadId === leadId).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStageLabel = (stage: string) => {
    const found = LEAD_STAGES.find(s => s.value === stage);
    return found?.label || stage;
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'gathering_requirement': return 'bg-slate-500';
      case 'prototype': return 'bg-indigo-500';
      case 'proposal': return 'bg-blue-500';
      case 'negotiation': return 'bg-yellow-500';
      case 'review': return 'bg-purple-500';
      case 'won': return 'bg-success';
      case 'lost': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const renderNotes = (notes: string) => {
    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = notes.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (!lead) return null;

  return (
    <Card className="border-0 shadow-none">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium">History Perubahan</h4>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Belum ada history perubahan
        </p>
      ) : (
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.id} className="relative pl-6 pb-6 last:pb-0">
                {/* Timeline connector */}
                <div className="absolute left-[3px] top-6 bottom-0 w-[2px] bg-muted last:hidden" />

                {/* Timeline dot */}
                <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ring-4 ring-background ${getStageColor(h.newStage)}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {h.previousStage ? (
                      <>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {getStageLabel(h.previousStage)}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="default" className={`text-[10px] h-5 ${getStageColor(h.newStage)}`}>
                          {getStageLabel(h.newStage)}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="default" className={`text-[10px] h-5 ${getStageColor(h.newStage)}`}>
                        {getStageLabel(h.newStage)} (Created)
                      </Badge>
                    )}
                  </div>

                  {h.notes && (
                    <div className="text-sm text-foreground bg-muted/30 p-2 rounded-md mb-2 break-words">
                      {renderNotes(h.notes)}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="font-medium text-foreground/70">{h.changedBy}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(h.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
