import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CurrencyInput, parseFormattedNumber } from '@/components/ui/currency-input';
import { LeadHistoryView } from '@/components/admin/LeadHistoryView';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, LEAD_STAGES, LEAD_SOURCES, LOSS_REASONS } from '@/lib/mockData';
import type { Lead, LeadStage, LeadSource } from '@/lib/mockData';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Target, Users, History, Eye, Zap, MessageSquare, RefreshCcw, Search } from 'lucide-react';

const initialFormData = {
  companyName: '',
  projectName: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  estimatedValue: '',
  probability: '50',
  stage: 'proposal' as LeadStage,
  source: 'other' as LeadSource,
  proposalDate: '',
  expectedCloseDate: '',
  closedDate: '',
  lossReason: '',
  lossDetails: '',
  winFactors: '',
  competitor: '',
  notes: '',
  changedBy: '',
};

export function LeadPipeline() {
  const { leads, addLead, updateLead, deleteLead, getLeadHistory, addLeadHistory, refreshData } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isQuickUpdateOpen, setIsQuickUpdateOpen] = useState(false);
  const [quickUpdateData, setQuickUpdateData] = useState({
    stage: 'proposal' as LeadStage,
    probability: '50',
    estimatedValue: '',
    notes: '',
    changedBy: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast({ title: 'Refreshed', description: 'Data updated from database' });
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(lead).some(val =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(searchLower)
    );
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingLead(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleViewHistory = (leadId: string) => {
    setSelectedLeadId(leadId);
    setHistoryOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      companyName: lead.companyName,
      projectName: lead.projectName,
      contactPerson: lead.contactPerson || '',
      contactEmail: lead.contactEmail || '',
      contactPhone: lead.contactPhone || '',
      estimatedValue: lead.estimatedValue.toString(),
      probability: lead.probability.toString(),
      stage: lead.stage,
      source: lead.source,
      proposalDate: lead.proposalDate || '',
      expectedCloseDate: lead.expectedCloseDate || '',
      closedDate: lead.closedDate || '',
      lossReason: lead.lossReason || '',
      lossDetails: lead.lossDetails || '',
      winFactors: lead.winFactors || '',
      competitor: lead.competitor || '',
      notes: lead.notes || '',
      changedBy: '',
    });
    setIsOpen(true);
  };

  const handleQuickUpdate = (lead: Lead) => {
    setEditingLead(lead);
    setQuickUpdateData({
      stage: lead.stage,
      probability: lead.probability.toString(),
      estimatedValue: lead.estimatedValue.toString(),
      notes: '',
      changedBy: '',
    });
    setIsQuickUpdateOpen(true);
  };

  const handleQuickUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    if (!quickUpdateData.changedBy.trim()) {
      toast({ title: 'Error', description: 'Mohon isi nama PIC yang melakukan perubahan', variant: 'destructive' });
      return;
    }

    try {
      const shouldUpdateValue = ['proposal', 'negotiation', 'won'].includes(quickUpdateData.stage);

      const updateData = {
        stage: quickUpdateData.stage,
        probability: shouldUpdateValue ? parseInt(quickUpdateData.probability) : undefined,
        estimatedValue: shouldUpdateValue ? parseFormattedNumber(quickUpdateData.estimatedValue) : undefined,
        // We don't overwrite lead.notes here, we only use quickUpdateData.notes for history
      };

      // Filter out undefined values
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      await updateLead(editingLead.id, cleanUpdateData, quickUpdateData.changedBy, editingLead.stage, quickUpdateData.notes);

      // If stage DID NOT change but notes WERE present, we need to add history manually 
      // because updateLead (in useDatabase) only adds history automatically if the STAGE changes.
      if (quickUpdateData.stage === editingLead.stage && quickUpdateData.notes) {
        await addLeadHistory({
          leadId: editingLead.id,
          newStage: quickUpdateData.stage,
          changedBy: quickUpdateData.changedBy,
          notes: quickUpdateData.notes,
        });
      }

      toast({ title: 'Berhasil', description: 'Progres lead berhasil diperbarui' });
      setIsQuickUpdateOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memperbarui progres lead', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.changedBy.trim()) {
      toast({ title: 'Error', description: 'Mohon isi nama PIC yang melakukan perubahan', variant: 'destructive' });
      return;
    }

    try {
      const leadData = {
        companyName: formData.companyName,
        projectName: formData.projectName,
        contactPerson: formData.contactPerson || undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        estimatedValue: parseFormattedNumber(formData.estimatedValue),
        probability: parseInt(formData.probability),
        stage: formData.stage,
        source: formData.source,
        proposalDate: formData.proposalDate || undefined,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        closedDate: formData.closedDate || undefined,
        lossReason: formData.lossReason || undefined,
        lossDetails: formData.lossDetails || undefined,
        winFactors: formData.winFactors || undefined,
        competitor: formData.competitor || undefined,
        notes: formData.notes || undefined,
      };

      if (editingLead) {
        const previousStage = editingLead.stage;
        await updateLead(editingLead.id, leadData, formData.changedBy, previousStage);
        toast({ title: 'Berhasil', description: 'Lead berhasil diperbarui' });
      } else {
        await addLead(leadData, formData.changedBy);
        toast({ title: 'Berhasil', description: 'Lead baru berhasil ditambahkan' });
      }

      handleOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan lead', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLead(id);
      toast({ title: 'Dihapus', description: 'Lead berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus lead', variant: 'destructive' });
    }
  };

  const getStageStyles = (stage: LeadStage) => {
    switch (stage) {
      case 'gathering_requirement': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
      case 'prototype': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'proposal': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'negotiation': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'review': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'won': return 'bg-success/10 text-success border-success/20';
      case 'lost': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return '';
    }
  };

  // Analytics
  const totalPipelineValue = leads.filter(l => !['won', 'lost'].includes(l.stage))
    .reduce((sum, l) => sum + (l.estimatedValue * l.probability / 100), 0);
  const wonLeads = leads.filter(l => l.stage === 'won');
  const lostLeads = leads.filter(l => l.stage === 'lost');
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const winRate = wonLeads.length + lostLeads.length > 0
    ? ((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100).toFixed(0)
    : '0';

  // Loss reason analysis
  const lossReasonStats = lostLeads.reduce((acc, lead) => {
    const reason = lead.lossReason || 'Tidak ada alasan';
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Lead Pipeline Management</h3>
            <p className="text-sm text-muted-foreground">Kelola prospek dari penawaran hingga deal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingLead ? 'Edit Lead' : 'Tambah Lead Baru'}</DialogTitle>
                  <DialogDescription>
                    Isi detail lead untuk menambah atau memperbarui data.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* PIC Field - Required for history tracking */}
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="space-y-2">
                      <Label className="text-primary font-medium">PIC / Nama Anda *</Label>
                      <Input
                        value={formData.changedBy}
                        onChange={(e) => setFormData(prev => ({ ...prev, changedBy: e.target.value }))}
                        placeholder="Nama orang yang melakukan perubahan ini"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Nama ini akan dicatat di history perubahan</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Perusahaan *</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="PT Example Indonesia"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Proyek *</Label>
                      <Input
                        value={formData.projectName}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                        placeholder="Sistem CRM"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Person *</Label>
                      <Input
                        value={formData.contactPerson}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="Nama kontak"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="email@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telepon</Label>
                      <Input
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="08123456789"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimasi Nilai</Label>
                      <CurrencyInput
                        value={formData.estimatedValue}
                        onChange={(value) => setFormData(prev => ({ ...prev, estimatedValue: value }))}
                        placeholder="1.000.000.000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Probabilitas Win (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => setFormData(prev => ({ ...prev, probability: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stage *</Label>
                      <Select
                        value={formData.stage}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, stage: v as LeadStage }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LEAD_STAGES.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sumber Lead</Label>
                      <Select
                        value={formData.source}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, source: v as LeadSource }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {LEAD_SOURCES.map(s => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal Proposal</Label>
                      <Input
                        type="date"
                        value={formData.proposalDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, proposalDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Close</Label>
                      <Input
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tanggal Closing</Label>
                      <Input
                        type="date"
                        value={formData.closedDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, closedDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  {formData.stage === 'lost' && (
                    <div className="space-y-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                      <h4 className="font-medium text-destructive">Analisis Kekalahan</h4>
                      <div className="space-y-2">
                        <Label>Alasan Kalah</Label>
                        <Select
                          value={formData.lossReason}
                          onValueChange={(v) => setFormData(prev => ({ ...prev, lossReason: v }))}
                        >
                          <SelectTrigger><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                          <SelectContent>
                            {LOSS_REASONS.map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Detail / Pembelajaran</Label>
                        <Textarea
                          value={formData.lossDetails}
                          onChange={(e) => setFormData(prev => ({ ...prev, lossDetails: e.target.value }))}
                          placeholder="Apa yang bisa dipelajari dari kekalahan ini?"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kompetitor yang Menang</Label>
                        <Input
                          value={formData.competitor}
                          onChange={(e) => setFormData(prev => ({ ...prev, competitor: e.target.value }))}
                          placeholder="Nama kompetitor"
                        />
                      </div>
                    </div>
                  )}

                  {formData.stage === 'won' && (
                    <div className="space-y-4 p-4 bg-success/5 rounded-lg border border-success/20">
                      <h4 className="font-medium text-success">Faktor Kemenangan</h4>
                      <div className="space-y-2">
                        <Label>Apa yang membuat kita menang?</Label>
                        <Textarea
                          value={formData.winFactors}
                          onChange={(e) => setFormData(prev => ({ ...prev, winFactors: e.target.value }))}
                          placeholder="Harga kompetitif, referensi bagus, fitur lengkap, dll."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Catatan</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Catatan tambahan..."
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingLead ? 'Update Lead' : 'Tambah Lead'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari lead (nama, proyek, contact, value, dll)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              History Lead
            </DialogTitle>
            <DialogDescription>
              Riwayat perubahan status dan aktivitas lead.
            </DialogDescription>
          </DialogHeader>
          {selectedLeadId && <LeadHistoryView leadId={selectedLeadId} />}
        </DialogContent>
      </Dialog>

      {/* Quick Update Dialog */}
      <Dialog open={isQuickUpdateOpen} onOpenChange={setIsQuickUpdateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              Quick Update Progress
            </DialogTitle>
            <DialogDescription>
              Perbarui status dan progres lead dengan cepat.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleQuickUpdateSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
              <Label className="text-xs font-semibold text-primary uppercase tracking-wider">PIC / Pelaku Perubahan *</Label>
              <Input
                value={quickUpdateData.changedBy}
                onChange={(e) => setQuickUpdateData(prev => ({ ...prev, changedBy: e.target.value }))}
                placeholder="Nama Anda"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stage Saat Ini</Label>
                <div className={`px-3 py-2 rounded-md border text-sm font-medium ${getStageStyles(editingLead?.stage || 'proposal')}`}>
                  {LEAD_STAGES.find(s => s.value === (editingLead?.stage || 'proposal'))?.label}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Stage Baru</Label>
                <Select
                  value={quickUpdateData.stage}
                  onValueChange={(v) => setQuickUpdateData(prev => ({ ...prev, stage: v as LeadStage }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STAGES.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {['proposal', 'negotiation', 'won'].includes(quickUpdateData.stage) && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Probabilitas (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={quickUpdateData.probability}
                    onChange={(e) => setQuickUpdateData(prev => ({ ...prev, probability: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nilai Estimasi</Label>
                  <CurrencyInput
                    value={quickUpdateData.estimatedValue}
                    onChange={(value) => setQuickUpdateData(prev => ({ ...prev, estimatedValue: value }))}
                  />
                </div>
              </div>
            )}


            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Catatan Progress
              </Label>
              <Textarea
                value={quickUpdateData.notes}
                onChange={(e) => setQuickUpdateData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Apa update terbaru dari lead ini?"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full">
              Simpan Perubahan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Analytics Cards */}
      <div className="grid grid-cols-4 gap-4 p-6 border-b">
        {/* Pipeline Value */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 cursor-help">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  Pipeline Value
                </div>
                <div className="text-xl font-bold">{formatCurrency(totalPipelineValue)}</div>
                <div className="text-xs text-muted-foreground">Weighted by probability</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Total nilai estimasi semua lead aktif yang sudah di-weight dengan probability. Contoh: lead Rp 100jt dengan probability 50% = Rp 50jt</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Win Rate */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20 cursor-help">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Win Rate
                </div>
                <div className="text-xl font-bold text-success">{winRate}%</div>
                <div className="text-xs text-muted-foreground">{wonLeads.length} won / {wonLeads.length + lostLeads.length} closed</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Persentase lead yang berhasil dimenangkan dari total lead yang sudah closed (won + lost). Semakin tinggi semakin baik!</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Active Leads */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 cursor-help">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  Active Leads
                </div>
                <div className="text-xl font-bold">{activeLeads.length}</div>
                <div className="text-xs text-muted-foreground">In pipeline</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Jumlah lead yang masih aktif dalam pipeline (belum won/lost). Lead yang sedang dalam proses follow-up.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Lost Leads */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 cursor-help">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4" />
                  Lost Leads
                </div>
                <div className="text-xl font-bold text-destructive">{lostLeads.length}</div>
                <div className="text-xs text-muted-foreground">
                  {Object.keys(lossReasonStats).length > 0 && `Top: ${Object.entries(lossReasonStats).sort((a, b) => b[1] - a[1])[0]?.[0]}`}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Jumlah lead yang gagal/lost. Menampilkan alasan kekalahan paling umum untuk pembelajaran.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua ({filteredLeads.length})</TabsTrigger>
          {LEAD_STAGES.map(stage => {
            const count = filteredLeads.filter(l => l.stage === stage.value).length;
            return (
              <TabsTrigger key={stage.value} value={stage.value}>
                {stage.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all">
          <LeadTable
            leads={filteredLeads}
            getStageStyles={getStageStyles}
            onEdit={handleEdit}
            onQuickUpdate={handleQuickUpdate}
            onDelete={handleDelete}
            onViewHistory={handleViewHistory}
            getLeadHistory={getLeadHistory}
          />
        </TabsContent>

        {LEAD_STAGES.map(stage => (
          <TabsContent key={stage.value} value={stage.value}>
            <LeadTable
              leads={filteredLeads.filter(l => l.stage === stage.value)}
              getStageStyles={getStageStyles}
              onEdit={handleEdit}
              onQuickUpdate={handleQuickUpdate}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
              getLeadHistory={getLeadHistory}
            />
          </TabsContent>
        ))}
      </Tabs>
    </Card >
  );
}

interface LeadTableProps {
  leads: Lead[];
  getStageStyles: (stage: LeadStage) => string;
  onEdit: (lead: Lead) => void;
  onQuickUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewHistory: (leadId: string) => void;
  getLeadHistory: (leadId: string) => any[];
}

function LeadTable({ leads, getStageStyles, onEdit, onQuickUpdate, onDelete, onViewHistory, getLeadHistory }: LeadTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Perusahaan / Proyek</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>History</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const history = getLeadHistory(lead.id);
            return (
              <TableRow key={lead.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{lead.companyName}</div>
                    <div className="text-sm text-muted-foreground">{lead.projectName}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{lead.contactPerson || '-'}</div>
                    <div className="text-muted-foreground">{lead.contactEmail || ''}</div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatCurrency(lead.estimatedValue)}</TableCell>
                <TableCell>
                  <Badge className={getStageStyles(lead.stage)}>
                    {LEAD_STAGES.find(s => s.value === lead.stage)?.label}
                  </Badge>
                </TableCell>
                <TableCell>{lead.probability}%</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewHistory(lead.id)}
                    className="flex items-center gap-1"
                  >
                    <History className="h-4 w-4" />
                    <span className="text-xs">{history.length}</span>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onQuickUpdate(lead)}
                      title="Quick Update"
                      className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    >
                      <Zap className="h-4 w-4 fill-current" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(lead)} title="Edit Detail">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(lead.id)} title="Hapus">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {leads.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                Tidak ada lead
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
