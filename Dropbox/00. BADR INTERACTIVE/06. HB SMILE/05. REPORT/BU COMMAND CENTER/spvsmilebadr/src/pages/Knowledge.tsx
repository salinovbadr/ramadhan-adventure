import { useState, useEffect } from 'react';
import { Plus, FileText, History, Share2, Edit, Trash2, ExternalLink, Search, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DocumentHistory } from '@/components/knowledge/DocumentHistory';
import { MarkdownEditor } from '@/components/knowledge/MarkdownEditor';
import { FileUpload } from '@/components/knowledge/FileUpload';
import { FAQEditor, FAQItem } from '@/components/knowledge/FAQEditor';

type DocumentCategory = 'sop' | 'aturan' | 'keputusan' | 'panduan' | 'lainnya';
type DocumentStatus = 'draft' | 'published' | 'archived';

interface Attachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

interface Document {
  id: string;
  title: string;
  content: string | null;
  category: DocumentCategory;
  status: DocumentStatus;
  public_slug: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  attachments: Attachment[] | null;
}

const categoryLabels: Record<DocumentCategory, string> = {
  sop: 'SOP',
  aturan: 'Aturan',
  keputusan: 'Keputusan',
  panduan: 'Panduan',
  lainnya: 'Lainnya',
};

const statusLabels: Record<DocumentStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

const statusColors: Record<DocumentStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
};

export default function Knowledge() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [historyDocId, setHistoryDocId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'lainnya' as DocumentCategory,
    status: 'draft' as DocumentStatus,
    is_public: false,
    change_notes: '',
    attachments: [] as Attachment[],
    faqs: [] as FAQItem[],
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Parse attachments from JSON
      const parsedDocs = (data || []).map(doc => ({
        ...doc,
        attachments: doc.attachments ? (doc.attachments as unknown as Attachment[]) : [],
      }));
      setDocuments(parsedDocs);
    }
    setIsLoading(false);
  };

  const fetchDocumentFaqs = async (documentId: string): Promise<FAQItem[]> => {
    const { data } = await supabase
      .from('document_faqs')
      .select('*')
      .eq('document_id', documentId)
      .order('order_index');
    return (data || []).map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order_index: faq.order_index,
    }));
  };

  const handleCreate = async () => {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        is_public: formData.is_public,
        public_slug: formData.is_public ? crypto.randomUUID().split('-')[0] : null,
        created_by: user?.id,
        attachments: JSON.parse(JSON.stringify(formData.attachments)),
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Create initial version
    await supabase.from('document_versions').insert({
      document_id: data.id,
      version_number: 1,
      title: formData.title,
      content: formData.content,
      change_notes: 'Dokumen dibuat',
      edited_by: user?.id,
      edited_by_email: user?.email,
    });

    // Create FAQs
    if (formData.faqs.length > 0) {
      await supabase.from('document_faqs').insert(
        formData.faqs.map(faq => ({
          document_id: data.id,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
        }))
      );
    }

    toast({ title: 'Berhasil', description: 'Dokumen berhasil dibuat' });
    setIsCreateOpen(false);
    resetForm();
    fetchDocuments();
  };

  const handleUpdate = async () => {
    if (!editingDoc) return;

    // Get current version number
    const { data: versions } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', editingDoc.id)
      .order('version_number', { ascending: false })
      .limit(1);

    const newVersion = (versions?.[0]?.version_number || 0) + 1;

    const { error } = await supabase
      .from('documents')
      .update({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        is_public: formData.is_public,
        public_slug: formData.is_public && !editingDoc.public_slug 
          ? crypto.randomUUID().split('-')[0] 
          : editingDoc.public_slug,
        attachments: JSON.parse(JSON.stringify(formData.attachments)),
      })
      .eq('id', editingDoc.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    // Create new version
    await supabase.from('document_versions').insert({
      document_id: editingDoc.id,
      version_number: newVersion,
      title: formData.title,
      content: formData.content,
      change_notes: formData.change_notes || 'Dokumen diperbarui',
      edited_by: user?.id,
      edited_by_email: user?.email,
    });

    // Update FAQs - delete existing and insert new
    await supabase.from('document_faqs').delete().eq('document_id', editingDoc.id);
    if (formData.faqs.length > 0) {
      await supabase.from('document_faqs').insert(
        formData.faqs.map(faq => ({
          document_id: editingDoc.id,
          question: faq.question,
          answer: faq.answer,
          order_index: faq.order_index,
        }))
      );
    }

    toast({ title: 'Berhasil', description: 'Dokumen berhasil diperbarui' });
    setEditingDoc(null);
    resetForm();
    fetchDocuments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;

    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Berhasil', description: 'Dokumen berhasil dihapus' });
      fetchDocuments();
    }
  };

  const copyPublicLink = (slug: string) => {
    const url = `${window.location.origin}/doc/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link Disalin', description: url });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'lainnya',
      status: 'draft',
      is_public: false,
      change_notes: '',
      attachments: [],
      faqs: [],
    });
  };

  const openEdit = async (doc: Document) => {
    setEditingDoc(doc);
    const faqs = await fetchDocumentFaqs(doc.id);
    setFormData({
      title: doc.title,
      content: doc.content || '',
      category: doc.category,
      status: doc.status,
      is_public: doc.is_public,
      change_notes: '',
      attachments: doc.attachments || [],
      faqs,
    });
  };

  const filteredDocs = documents.filter((doc) => {
    const matchSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  const DocumentForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Judul Dokumen</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Masukkan judul dokumen"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v as DocumentCategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => setFormData({ ...formData, status: v as DocumentStatus })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Konten (Markdown)</Label>
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          placeholder="Tulis konten dokumen dengan Markdown..."
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          Lampiran
        </Label>
        <FileUpload
          attachments={formData.attachments}
          onAttachmentsChange={(attachments) => setFormData({ ...formData, attachments })}
        />
      </div>

      <FAQEditor
        faqs={formData.faqs}
        onFaqsChange={(faqs) => setFormData({ ...formData, faqs })}
      />

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.is_public}
            onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
          />
          <Label>Bisa diakses publik via link</Label>
        </div>
      </div>
      {isEdit && (
        <div className="space-y-2">
          <Label>Catatan Perubahan</Label>
          <Input
            value={formData.change_notes}
            onChange={(e) => setFormData({ ...formData, change_notes: e.target.value })}
            placeholder="Jelaskan perubahan yang dilakukan..."
          />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            isEdit ? setEditingDoc(null) : setIsCreateOpen(false);
            resetForm();
          }}
        >
          Batal
        </Button>
        <Button onClick={isEdit ? handleUpdate : handleCreate}>
          {isEdit ? 'Simpan Perubahan' : 'Buat Dokumen'}
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Knowledge Management</h1>
          <p className="text-muted-foreground">Kelola SOP, aturan, keputusan, dan dokumen penting lainnya</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Buat Dokumen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Buat Dokumen Baru</DialogTitle>
            </DialogHeader>
            <DocumentForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokumen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada dokumen</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      {doc.title}
                      {doc.attachments && doc.attachments.length > 0 && (
                        <Badge variant="outline" className="ml-2">
                          <Paperclip className="h-3 w-3 mr-1" />
                          {doc.attachments.length}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Terakhir diperbarui: {new Date(doc.updated_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{categoryLabels[doc.category]}</Badge>
                    <Badge className={statusColors[doc.status]}>{statusLabels[doc.status]}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {doc.content || 'Tidak ada konten'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {doc.is_public && doc.public_slug && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPublicLink(doc.public_slug!)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Salin Link
                      </Button>
                    )}
                    {doc.is_public && doc.public_slug && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/doc/${doc.public_slug}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Buka
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHistoryDocId(doc.id)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Riwayat
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(doc)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dokumen</DialogTitle>
          </DialogHeader>
          <DocumentForm isEdit />
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <DocumentHistory
        documentId={historyDocId}
        onClose={() => setHistoryDocId(null)}
      />
    </div>
  );
}
