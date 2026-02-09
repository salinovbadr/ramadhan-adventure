import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Building2, Paperclip, HelpCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

interface PublicDoc {
  id: string;
  title: string;
  content: string | null;
  category: string;
  updated_at: string;
  attachments: Attachment[] | null;
}

const categoryLabels: Record<string, string> = {
  sop: 'SOP',
  aturan: 'Aturan',
  keputusan: 'Keputusan',
  panduan: 'Panduan',
  lainnya: 'Lainnya',
};

export default function PublicDocument() {
  const { slug } = useParams<{ slug: string }>();
  const [document, setDocument] = useState<PublicDoc | null>(null);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchDocument();
  }, [slug]);

  const fetchDocument = async () => {
    if (!slug) {
      setError('Link tidak valid');
      setIsLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, content, category, updated_at, attachments')
      .eq('public_slug', slug)
      .eq('is_public', true)
      .eq('status', 'published')
      .single();

    if (fetchError || !data) {
      setError('Dokumen tidak ditemukan atau tidak dapat diakses');
    } else {
      setDocument({
        ...data,
        attachments: data.attachments ? (data.attachments as unknown as Attachment[]) : null,
      });

      // Fetch FAQs
      const { data: faqData } = await supabase
        .from('document_faqs')
        .select('*')
        .eq('document_id', data.id)
        .order('order_index');
      
      if (faqData) {
        setFaqs(faqData);
      }
    }
    setIsLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Command Center</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge variant="outline">
                  {categoryLabels[document?.category || 'lainnya']}
                </Badge>
                <CardTitle className="text-2xl">{document?.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Terakhir diperbarui:{' '}
                  {new Date(document?.updated_at || '').toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Content with Markdown */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {document?.content || '*Tidak ada konten*'}
              </ReactMarkdown>
            </div>

            {/* Attachments */}
            {document?.attachments && document.attachments.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Lampiran ({document.attachments.length})
                </h3>
                <div className="space-y-2">
                  {document.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  FAQ ({faqs.length})
                </h3>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <Collapsible
                      key={faq.id}
                      open={openFaqIndex === index}
                      onOpenChange={(open) => setOpenFaqIndex(open ? index : null)}
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-md border hover:bg-muted/50 transition-colors text-left">
                        <span className="font-medium">{faq.question}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openFaqIndex === index ? 'rotate-180' : ''
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4 pt-2">
                        <div className="text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {faq.answer}
                          </ReactMarkdown>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Command Center. Dokumen ini dibagikan secara publik.
        </div>
      </footer>
    </div>
  );
}
