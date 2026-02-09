import { useEffect, useState } from 'react';
import { Clock, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DocumentVersion {
  id: string;
  version_number: number;
  title: string;
  content: string | null;
  change_notes: string | null;
  edited_by_email: string | null;
  created_at: string;
}

interface DocumentHistoryProps {
  documentId: string | null;
  onClose: () => void;
}

export function DocumentHistory({ documentId, onClose }: DocumentHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (documentId) {
      fetchVersions();
    }
  }, [documentId]);

  const fetchVersions = async () => {
    if (!documentId) return;
    setIsLoading(true);

    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (!error) {
      setVersions(data || []);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={!!documentId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Riwayat Perubahan Dokumen</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">Loading...</div>
          ) : versions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Tidak ada riwayat
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className="relative border rounded-lg p-4 bg-card"
                >
                  {index < versions.length - 1 && (
                    <div className="absolute left-6 top-full h-4 w-0.5 bg-border" />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{version.version_number}</Badge>
                      <span className="font-medium">{version.title}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{version.edited_by_email || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(version.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {version.change_notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded px-3 py-2 mb-2">
                      📝 {version.change_notes}
                    </p>
                  )}
                  {version.content && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary hover:underline">
                        Lihat konten versi ini
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap bg-muted/30 rounded p-3 text-xs max-h-40 overflow-y-auto">
                        {version.content}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
