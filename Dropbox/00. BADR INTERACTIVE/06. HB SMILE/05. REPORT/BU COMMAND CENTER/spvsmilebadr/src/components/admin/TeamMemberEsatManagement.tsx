import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import type { TeamMemberEsat } from '@/lib/mockData';
import { Plus, Pencil, Trash2, Smile, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { CsvImport } from './CsvImport';

const MONTHS = [
  'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
  'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
  'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
  'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025',
  'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026',
  'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
];

const initialFormData = {
  teamMemberId: '',
  month: format(new Date(), 'MMM yyyy'),
  esatScore: '80',
  notes: '',
};

const ESAT_CSV_COLUMNS = [
  { key: 'name', label: 'Nama Anggota Tim', required: true },
  { key: 'month', label: 'Jan 2025', required: true },
  { key: 'score', label: '80', required: true },
  { key: 'notes', label: 'Catatan (opsional)', required: false },
];

export function TeamMemberEsatManagement() {
  const { teamMembers, teamMemberEsat, addTeamMemberEsat, updateTeamMemberEsat, deleteTeamMemberEsat } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingEsat, setEditingEsat] = useState<TeamMemberEsat | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMM yyyy'));

  const handleImportEsat = async (data: Record<string, string>[]) => {
    for (const row of data) {
      // Find team member by name
      const member = teamMembers.find(m => m.name.toLowerCase() === row.name?.toLowerCase());
      if (!member) {
        toast({ 
          title: 'Warning', 
          description: `Anggota tim "${row.name}" tidak ditemukan, data dilewati`,
          variant: 'destructive' 
        });
        continue;
      }

      await addTeamMemberEsat({
        teamMemberId: member.id,
        month: row.month,
        esatScore: parseFloat(row.score) || 0,
        notes: row.notes || undefined,
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingEsat(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (esat: TeamMemberEsat) => {
    setEditingEsat(esat);
    setFormData({
      teamMemberId: esat.teamMemberId,
      month: esat.month,
      esatScore: esat.esatScore.toString(),
      notes: esat.notes || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const esatData = {
        teamMemberId: formData.teamMemberId,
        month: formData.month,
        esatScore: parseFloat(formData.esatScore),
        notes: formData.notes || undefined,
      };

      if (editingEsat) {
        await updateTeamMemberEsat(editingEsat.id, esatData);
        toast({ title: 'Berhasil', description: 'ESAT berhasil diperbarui' });
      } else {
        await addTeamMemberEsat(esatData);
        toast({ title: 'Berhasil', description: 'ESAT baru berhasil ditambahkan' });
      }

      handleOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan ESAT', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeamMemberEsat(id);
      toast({ title: 'Dihapus', description: 'ESAT berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus ESAT', variant: 'destructive' });
    }
  };

  const getTeamMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || 'Unknown';
  const getTeamMemberPosition = (id: string) => teamMembers.find(m => m.id === id)?.position || '';

  const filteredEsat = teamMemberEsat.filter(e => e.month === selectedMonth);

  // Calculate average ESAT
  const avgEsat = filteredEsat.length > 0 
    ? (filteredEsat.reduce((sum, e) => sum + e.esatScore, 0) / filteredEsat.length).toFixed(1)
    : '0';

  // Get ESAT history by member
  const esatByMember = teamMemberEsat.reduce((acc, esat) => {
    if (!acc[esat.teamMemberId]) acc[esat.teamMemberId] = [];
    acc[esat.teamMemberId].push(esat);
    return acc;
  }, {} as Record<string, TeamMemberEsat[]>);

  const getEsatTrend = (memberId: string) => {
    const memberEsats = (esatByMember[memberId] || []).sort((a, b) => a.month.localeCompare(b.month));
    if (memberEsats.length < 2) return null;
    const latest = memberEsats[memberEsats.length - 1].esatScore;
    const previous = memberEsats[memberEsats.length - 2].esatScore;
    return latest - previous;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-yellow-500';
    return 'text-destructive';
  };

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smile className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">ESAT per Anggota Tim</h3>
              <p className="text-sm text-muted-foreground">Pantau kepuasan kerja setiap anggota tim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CsvImport
              title="Import ESAT Tim"
              description="Import data ESAT dari file CSV. Nama anggota harus sesuai dengan data yang sudah ada."
              templateColumns={ESAT_CSV_COLUMNS}
              onImport={handleImportEsat}
              templateFileName="template_esat_tim.csv"
            />
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Input ESAT
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEsat ? 'Edit ESAT' : 'Input ESAT Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Anggota Tim *</Label>
                  <Select value={formData.teamMemberId} onValueChange={(v) => setFormData(prev => ({ ...prev, teamMemberId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih anggota" /></SelectTrigger>
                    <SelectContent>
                      {teamMembers.filter(m => m.isActive).map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name} - {m.position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bulan *</Label>
                    <Select value={formData.month} onValueChange={(v) => setFormData(prev => ({ ...prev, month: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map(m => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Score ESAT (0-100)</Label>
                    <Input 
                      type="number"
                      min="0"
                      max="100"
                      value={formData.esatScore} 
                      onChange={(e) => setFormData(prev => ({ ...prev, esatScore: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} 
                    placeholder="Catatan atau feedback..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingEsat ? 'Update ESAT' : 'Simpan ESAT'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 border-b bg-muted/30">
        <div className="flex items-center gap-4 mb-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rata-rata ESAT:</span>
            <span className={`text-2xl font-bold ${getScoreColor(parseFloat(avgEsat))}`}>{avgEsat}%</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Anggota Tim</TableHead>
                <TableHead>ESAT {selectedMonth}</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>History</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.filter(m => m.isActive).map((member) => {
                const memberEsats = esatByMember[member.id] || [];
                const currentEsat = memberEsats.find(e => e.month === selectedMonth);
                const trend = getEsatTrend(member.id);
                
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {currentEsat ? (
                        <div className="flex items-center gap-2">
                          <Progress value={currentEsat.esatScore} className="w-20 h-2" />
                          <span className={`font-medium ${getScoreColor(currentEsat.esatScore)}`}>
                            {currentEsat.esatScore}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {trend !== null && (
                        <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{trend > 0 ? '+' : ''}{trend.toFixed(1)}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {memberEsats.slice(-4).map(e => (
                          <Badge key={e.id} variant="secondary" className="text-xs">
                            {e.month}: {e.esatScore}%
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {currentEsat && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(currentEsat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(currentEsat.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
