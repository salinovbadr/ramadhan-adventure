import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CurrencyInput, parseFormattedNumber, formatWithThousandSeparator } from '@/components/ui/currency-input';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/mockData';
import { Plus, Pencil, Trash2, History, DollarSign, TrendingUp, Calendar as CalendarIcon, Clock, RefreshCcw, Search } from 'lucide-react';
import type { Project, ProjectRevenue } from '@/lib/mockData';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ProjectManagementProps {
  onNavigate?: (tab: string) => void;
}

export function ProjectManagement({ onNavigate }: ProjectManagementProps) {
  const {
    projects, addProject, updateProject, deleteProject,
    projectAllocations, teamMembers, projectRevenues,
    addProjectRevenue, deleteProjectRevenue, refreshData
  } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    budget: '',
    actualCost: '',
    revenue: '',
    cogs: '',
    status: 'On Track' as Project['status'],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast({ title: 'Refreshed', description: 'Data updated from database' });
  };

  const filteredProjects = projects.filter(project => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    // Search in project fields and related revenue/team info could be complex, 
    // but generic object search is a good start. 
    // Can also explicitly search in team members if needed.
    return Object.values(project).some(val =>
      val !== null && val !== undefined && String(val).toLowerCase().includes(searchLower)
    );
  });

  const resetForm = () => {
    setFormData({ name: '', budget: '', actualCost: '', revenue: '', cogs: '', status: 'On Track' });
    setEditingProject(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      budget: project.budget.toString(),
      actualCost: project.actualCost.toString(),
      revenue: project.revenue.toString(),
      cogs: project.cogs.toString(),
      status: project.status,
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const projectData = {
        name: formData.name,
        budget: parseFormattedNumber(formData.budget),
        actualCost: parseFormattedNumber(formData.actualCost),
        revenue: parseFormattedNumber(formData.revenue),
        cogs: parseFormattedNumber(formData.cogs),
        status: formData.status,
      };

      if (editingProject) {
        await updateProject(editingProject.id, projectData);
        toast({ title: 'Berhasil', description: 'Proyek berhasil diperbarui' });
      } else {
        await addProject(projectData);
        toast({ title: 'Berhasil', description: 'Proyek baru berhasil dibuat' });
      }

      handleOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan proyek', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      toast({ title: 'Dihapus', description: 'Proyek berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus proyek', variant: 'destructive' });
    }
  };

  const currentMonth = format(new Date(), 'MMM yyyy');

  const getProjectTeam = (projectId: string) => {
    const allocations = projectAllocations.filter(a => a.projectId === projectId && a.month === currentMonth);
    return allocations.map(a => {
      const member = teamMembers.find(m => m.id === a.teamMemberId);
      return { ...a, memberName: member?.name || 'Unknown' };
    });
  };

  const getProjectLoad = (projectId: string) => {
    const allocations = projectAllocations.filter(a => a.projectId === projectId && a.month === currentMonth);
    return allocations.reduce((sum, a) => sum + (a.allocationPercentage || 0), 0);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-success/10 text-success border-success/20';
      case 'At Risk':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Underperform':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return '';
    }
  };

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Project Management</h3>
            <p className="text-sm text-muted-foreground">Kelola proyek dan anggaran</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Proyek
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProject ? 'Edit Proyek' : 'Buat Proyek Baru'}</DialogTitle>
                  <DialogDescription>
                    Isi detail proyek untuk membuat baru atau memperbarui data.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama Proyek</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Masukkan nama proyek"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Budget</Label>
                      <CurrencyInput
                        value={formData.budget}
                        onChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}
                        placeholder="500.000.000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Actual Cost</Label>
                      <CurrencyInput
                        value={formData.actualCost}
                        onChange={(value) => setFormData(prev => ({ ...prev, actualCost: value }))}
                        placeholder="450.000.000"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Revenue</Label>
                      <CurrencyInput
                        value={formData.revenue}
                        onChange={(value) => setFormData(prev => ({ ...prev, revenue: value }))}
                        placeholder="800.000.000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>COGS</Label>
                      <CurrencyInput
                        value={formData.cogs}
                        onChange={(value) => setFormData(prev => ({ ...prev, cogs: value }))}
                        placeholder="300.000.000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as Project['status'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="On Track">On Track</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="Underperform">Underperform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Menyimpan...' : (editingProject ? 'Update Proyek' : 'Buat Proyek')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari proyek (nama, status, nilai, dll)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Proyek</TableHead>
                <TableHead>Tim ({currentMonth})</TableHead>
                <TableHead className="text-center">Total Load</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-center">Revenue Progress</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const projectTeam = getProjectTeam(project.id);
                const totalLoad = getProjectLoad(project.id);
                const projectRevHistory = projectRevenues.filter(r => r.projectId === project.id);
                const totalAchieved = projectRevHistory.reduce((sum, r) => sum + r.amount, 0);
                const progressPercentage = project.budget > 0 ? Math.min(Math.round((totalAchieved / project.budget) * 100), 100) : 0;

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium whitespace-nowrap">{project.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 min-w-[120px]">
                        {projectTeam.length > 0 ? (
                          projectTeam.map((tm) => (
                            <Badge
                              key={tm.id}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-secondary/80"
                              onClick={() => onNavigate?.('team')}
                            >
                              {tm.memberName.split(' ')[0]}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">Belum ada tim</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={totalLoad > 100 ? 'destructive' : totalLoad > 0 ? 'default' : 'outline'} className="text-[10px]">
                        {totalLoad}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(project.budget)}</TableCell>
                    <TableCell className="min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-medium">
                          <span>{progressPercentage}%</span>
                          <span className="text-muted-foreground">{formatCurrency(totalAchieved)}</span>
                        </div>
                        <Progress value={progressPercentage} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusStyles(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-1">
                        <RevenueHistoryDialog
                          project={project}
                          revenues={projectRevHistory}
                          onAdd={addProjectRevenue}
                          onDelete={deleteProjectRevenue}
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(project)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card >
  );
}

interface RevenueHistoryDialogProps {
  project: Project;
  revenues: ProjectRevenue[];
  onAdd: (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

function RevenueHistoryDialog({ project, revenues, onAdd, onDelete }: RevenueHistoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), note: '' });
  const totalAchieved = revenues.reduce((sum, r) => sum + r.amount, 0);
  const remaining = Math.max(project.budget - totalAchieved, 0);
  const progressPercentage = project.budget > 0 ? Math.min(Math.round((totalAchieved / project.budget) * 100), 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onAdd({
        projectId: project.id,
        amount: parseFormattedNumber(formData.amount),
        date: formData.date,
        note: formData.note,
      });
      setFormData({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), note: '' });
      setIsAdding(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Revenue History - {project.name}
          </DialogTitle>
          <DialogDescription>
            Riwayat pendapatan dan target budget proyek.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 py-4">
          <Card className="p-3 bg-primary/5 border-none shadow-none">
            <div className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Target
            </div>
            <div className="text-sm font-bold mt-1 text-primary">{formatCurrency(project.budget)}</div>
          </Card>
          <Card className="p-3 bg-green-50 border-none shadow-none">
            <div className="text-[10px] text-green-600 uppercase font-bold flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Tercapai
            </div>
            <div className="text-sm font-bold mt-1 text-green-700">{formatCurrency(totalAchieved)}</div>
          </Card>
          <Card className="p-3 bg-amber-50 border-none shadow-none">
            <div className="text-[10px] text-amber-600 uppercase font-bold flex items-center gap-1">
              <Clock className="h-3 w-3" /> Sisa
            </div>
            <div className="text-sm font-bold mt-1 text-amber-700">{formatCurrency(remaining)}</div>
          </Card>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs font-semibold">
            <span>Progress Pengumpulan</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Separator />

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">Riwayat Penambahan</h3>
            <Button size="sm" variant={isAdding ? 'ghost' : 'default'} onClick={() => setIsAdding(!isAdding)}>
              {isAdding ? 'Batal' : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Revenue
                </>
              )}
            </Button>
          </div>

          {isAdding && (
            <form onSubmit={handleSubmit} className="bg-muted/30 p-4 rounded-lg space-y-3 mb-4 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px]">Jumlah (IDR)</Label>
                  <CurrencyInput
                    value={formData.amount}
                    onChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                    placeholder="Contoh: 50.000.000"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px]">Tanggal</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px]">Catatan / Keterangan</Label>
                <Input
                  value={formData.note}
                  onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Termin 1, DP, atau pelunasan"
                  className="h-8 text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="w-full h-8 text-xs">Simpan Penambahan</Button>
            </form>
          )}

          <ScrollArea className="h-[250px] pr-4">
            {revenues.length > 0 ? (
              <div className="space-y-4">
                {[...revenues].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rev) => (
                  <div key={rev.id} className="relative pl-6 pb-2 border-l-2 border-primary/20 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-1 h-4 w-4 rounded-full bg-background border-2 border-primary" />
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-primary">{formatCurrency(rev.amount)}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CalendarIcon className="h-2.5 w-2.5" />
                          {format(parseISO(rev.date), 'dd MMMM yyyy', { locale: localeId })}
                        </div>
                        {rev.note && <div className="text-[11px] mt-1 text-foreground/80">{rev.note}</div>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => onDelete(rev.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
                <TrendingUp className="h-10 w-10 opacity-20 mb-2" />
                <p className="text-xs italic text-center">Belum ada riwayat pendapatan tercatat</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
