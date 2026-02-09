import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import type { ProjectTeamAllocation as AllocationT } from '@/lib/mockData';
import { Plus, Pencil, Trash2, CalendarDays, Users2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const MONTHS = [
  'Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024',
  'Jul 2024', 'Aug 2024', 'Sep 2024', 'Oct 2024', 'Nov 2024', 'Dec 2024',
  'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
  'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025',
  'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026',
  'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026',
];

const initialFormData = {
  projectId: '',
  teamMemberIds: [] as string[],
  month: format(new Date(), 'MMM yyyy'),
  allocationPercentage: '100',
  costType: 'hpp' as 'hpp' | 'opex',
  notes: '',
};

interface ProjectTeamAllocationProps {
  onNavigate?: (tab: string) => void;
}

export function ProjectTeamAllocation({ onNavigate }: ProjectTeamAllocationProps) {
  const { projects, teamMembers, projectAllocations, addProjectAllocation, updateProjectAllocation, deleteProjectAllocation } = useData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<AllocationT | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMM yyyy'));
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAllocation(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (allocation: AllocationT) => {
    setEditingAllocation(allocation);
    setFormData({
      projectId: allocation.projectId || '',
      teamMemberIds: [allocation.teamMemberId],
      month: allocation.month,
      allocationPercentage: allocation.allocationPercentage.toString(),
      costType: allocation.costType || 'hpp',
      notes: allocation.notes || '',
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formData.teamMemberIds.length === 0) {
        toast({ title: 'Error', description: 'Pilih minimal satu anggota tim', variant: 'destructive' });
        return;
      }

      const commonData = {
        projectId: formData.costType === 'hpp' ? formData.projectId : undefined,
        month: formData.month,
        allocationPercentage: parseInt(formData.allocationPercentage),
        costType: formData.costType,
        notes: formData.notes || undefined,
      };

      if (editingAllocation) {
        // Editing single allocation
        await updateProjectAllocation(editingAllocation.id, {
          ...commonData,
          teamMemberId: formData.teamMemberIds[0], // Only single member when editing
        });
        toast({ title: 'Berhasil', description: 'Alokasi tim berhasil diperbarui' });
      } else {
        // Adding new allocations (potentially multiple)
        const promises = formData.teamMemberIds.map(memberId =>
          addProjectAllocation({
            ...commonData,
            teamMemberId: memberId,
          })
        );

        await Promise.all(promises);
        toast({ title: 'Berhasil', description: `${formData.teamMemberIds.length} Alokasi tim baru berhasil ditambahkan` });
      }

      handleOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan alokasi tim', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectAllocation(id);
      toast({ title: 'Dihapus', description: 'Alokasi tim berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus alokasi', variant: 'destructive' });
    }
  };

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown';
  const getTeamMemberName = (id: string) => teamMembers.find(m => m.id === id)?.name || 'Unknown';

  const filteredAllocations = projectAllocations.filter(a => a.month === selectedMonth);

  // Group by project
  const allocationsByProject = filteredAllocations.reduce((acc, alloc) => {
    const projectId = alloc.projectId;
    if (!acc[projectId]) acc[projectId] = [];
    acc[projectId].push(alloc);
    return acc;
  }, {} as Record<string, AllocationT[]>);

  const projectIds = Object.keys(allocationsByProject);
  const totalPages = Math.ceil(projectIds.length / ITEMS_PER_PAGE);

  const paginatedProjectIds = projectIds.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate totals for the selected month
  const totalHPP = filteredAllocations
    .filter(a => a.costType === 'hpp')
    .reduce((sum, a) => sum + a.allocationPercentage, 0);

  const totalOPEX = filteredAllocations
    .filter(a => a.costType === 'opex')
    .reduce((sum, a) => sum + a.allocationPercentage, 0);

  // Group by team member
  const allocationsByMember = projectAllocations.reduce((acc, alloc) => {
    const memberId = alloc.teamMemberId;
    if (!acc[memberId]) acc[memberId] = [];
    acc[memberId].push(alloc);
    return acc;
  }, {} as Record<string, AllocationT[]>);

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users2 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Alokasi Tim Proyek</h3>
              <p className="text-sm text-muted-foreground">Kelola assignment tim ke proyek per bulan</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Alokasi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAllocation ? 'Edit Alokasi' : 'Tambah Alokasi Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipe Biaya *</Label>
                  <Select value={formData.costType} onValueChange={(v: 'hpp' | 'opex') => setFormData(prev => ({ ...prev, costType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Pilih tipe biaya" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hpp">HPP (Harga Pokok Penjualan)</SelectItem>
                      <SelectItem value="opex">OPEX (Biaya Operasional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.costType === 'hpp' && (
                  <div className="space-y-2">
                    <Label>Proyek *</Label>
                    <Select value={formData.projectId} onValueChange={(v) => setFormData(prev => ({ ...prev, projectId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Pilih proyek" /></SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Anggota Tim * {editingAllocation ? '(Single Edit)' : '(Multi-select)'}</Label>
                  {editingAllocation ? (
                    <Select
                      value={formData.teamMemberIds[0]}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, teamMemberIds: [v] }))}
                      disabled={true}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih anggota" /></SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
                      {teamMembers
                        .filter(m => m.isActive)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(m => (
                          <div key={m.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`member-${m.id}`}
                              checked={formData.teamMemberIds.includes(m.id)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  teamMemberIds: checked
                                    ? [...prev.teamMemberIds, m.id]
                                    : prev.teamMemberIds.filter(id => id !== m.id)
                                }));
                              }}
                              className="rounded border-gray-300 h-4 w-4"
                            />
                            <Label htmlFor={`member-${m.id}`} className="text-sm cursor-pointer font-normal">
                              {m.name} - <span className="text-muted-foreground text-xs">{m.position}</span>
                            </Label>
                          </div>
                        ))}
                    </div>
                  )}
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
                    <Label>Alokasi (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.allocationPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, allocationPercentage: e.target.value }))}
                    />
                  </div>
                </div>


                <div className="space-y-2">
                  <Label>Catatan</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Catatan tambahan"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingAllocation ? 'Update Alokasi' : 'Tambah Alokasi'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hidden allocation display - keeping only the add button accessible above */}
      {/* 
      <Tabs defaultValue="by-month" className="p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="by-month">
            <CalendarDays className="h-4 w-4 mr-2" />
            Per Bulan
          </TabsTrigger>
          <TabsTrigger value="by-member">
            <Users2 className="h-4 w-4 mr-2" />
            Per Anggota
          </TabsTrigger>
        </TabsList>

        <TabsContent value="by-month">
          <div className="mb-4">
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
          </div>

          {Object.keys(allocationsByProject).length > 0 ? (
            <div className="space-y-4">
              {paginatedProjectIds.map(projectId => {
                const allocations = allocationsByProject[projectId];
                return (
                  <div key={projectId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{projectId === 'null' || !projectId ? 'OPEX' : getProjectName(projectId)}</h4>
                    <div className="space-y-2">
                      {allocations.map(alloc => (
                        <div key={alloc.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{getTeamMemberName(alloc.teamMemberId)}</span>
                            {alloc.roleInProject && <Badge variant="outline">{alloc.roleInProject}</Badge>}
                            <Badge>{alloc.allocationPercentage}%</Badge>
                            <Badge variant={alloc.costType === 'opex' ? 'secondary' : 'default'}>
                              {alloc.costType === 'opex' ? 'OPEX' : 'HPP'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(alloc)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(alloc.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Pagination Controls }
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Totals Footer }
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/30 rounded-lg border">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total HPP (Allocation)</div>
                  <div className="text-2xl font-bold">{totalHPP}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {filteredAllocations.filter(a => a.costType === 'hpp').length} allocations
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Total OPEX (Allocation)</div>
                  <div className="text-2xl font-bold text-blue-600">{totalOPEX}%</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {filteredAllocations.filter(a => a.costType === 'opex').length} allocations
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Tidak ada alokasi untuk bulan {selectedMonth}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-member">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anggota Tim</TableHead>
                  <TableHead>Total Proyek</TableHead>
                  <TableHead>History Alokasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.filter(m => m.isActive).map((member) => {
                  const memberAllocations = allocationsByMember[member.id] || [];
                  const uniqueProjects = new Set(memberAllocations.filter(a => a.projectId).map(a => a.projectId)).size;

                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.position}</div>
                        </div>
                      </TableCell>
                      <TableCell>{uniqueProjects} proyek</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {memberAllocations.slice(0, 5).map(a => (
                            <Badge key={a.id} variant="secondary" className="text-xs">
                              {a.month}: {a.projectId ? getProjectName(a.projectId).substring(0, 15) : 'OPEX'}...
                            </Badge>
                          ))}
                          {memberAllocations.length > 5 && (
                            <Badge variant="outline">+{memberAllocations.length - 5} more</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      */}
    </Card>
  );
}
