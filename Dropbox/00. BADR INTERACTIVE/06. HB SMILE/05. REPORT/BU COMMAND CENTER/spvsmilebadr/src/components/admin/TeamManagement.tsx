import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { useSquads } from '@/hooks/useSquads';
import type { TeamMember } from '@/lib/mockData';
import { Plus, Pencil, Trash2, Users, Search, Filter, Briefcase, Terminal, Layout, Smartphone, PenTool, Bug, BarChart, Shield, FileText, Headset, Database, Package } from 'lucide-react';
import { CsvImport } from './CsvImport';
import { format } from 'date-fns';

const initialFormData = {
  name: '',
  email: '',
  position: '',
  squad: '',
  supervisor: '',
  employmentStatus: 'Permanent',
  isActive: true,
};

const TEAM_CSV_COLUMNS = [
  { key: 'name', label: 'Nama Lengkap', required: true },
  { key: 'email', label: 'email@contoh.com', required: false },
  { key: 'position', label: 'Posisi/Jabatan', required: false },
  { key: 'squad', label: 'Squad', required: false },
  { key: 'supervisor', label: 'Supervisor', required: false },
];

const getRoleStyle = (role: string) => {
  const normalized = role.toLowerCase();

  if (normalized.includes('backend')) return { icon: Database, color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' };
  if (normalized.includes('frontend')) return { icon: Layout, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (normalized.includes('mobile')) return { icon: Smartphone, color: 'text-indigo-600', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200' };
  if (normalized.includes('ui/ux') || normalized.includes('design')) return { icon: PenTool, color: 'text-pink-600', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' };
  if (normalized.includes('qa') || normalized.includes('test')) return { icon: Bug, color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' };
  if (normalized.includes('data')) return { icon: BarChart, color: 'text-cyan-600', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' };
  if (normalized.includes('security') || normalized.includes('devops') || normalized.includes('infra')) return { icon: Shield, color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' };
  if (normalized.includes('manager') || normalized.includes('head') || normalized.includes('lead')) return { icon: Briefcase, color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' };
  if (normalized.includes('analyst') || normalized.includes('writer')) return { icon: FileText, color: 'text-violet-600', bgColor: 'bg-violet-50', borderColor: 'border-violet-200' };
  if (normalized.includes('support') || normalized.includes('helpdesk')) return { icon: Headset, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
  if (normalized.includes('wms')) return { icon: Package, color: 'text-teal-600', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' };

  return { icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
};



interface TeamManagementProps {
  onNavigate?: (tab: string) => void;
}

export function TeamManagement({ onNavigate }: TeamManagementProps) {
  const { teamMembers, addTeamMember, updateTeamMember, deleteTeamMember, projects, projectAllocations } = useData();
  const { squads } = useSquads();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isManualSupervisor, setIsManualSupervisor] = useState(false);

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterSupervisor, setFilterSupervisor] = useState('all');
  const [filterRole, setFilterRole] = useState<string | null>(null);

  const allSupervisors = useMemo(() => {
    const existing = teamMembers.map(m => m.name);
    const added = teamMembers.map(m => m.supervisor).filter(Boolean) as string[];
    return [...new Set([...existing, ...added])].sort();
  }, [teamMembers]);

  const allSquads = useMemo(() => {
    const dbSquadNames = squads.map(s => s.name);
    const teamSquads = teamMembers.map(m => m.squad).filter(Boolean) as string[];
    const combined = [...new Set([...dbSquadNames, ...teamSquads])];
    return combined.sort();
  }, [teamMembers, squads]);

  const handleImportTeam = async (data: Record<string, string>[]) => {
    for (const row of data) {
      await addTeamMember({
        name: row.name,
        email: row.email || undefined,
        position: row.position || undefined,
        squad: row.squad || undefined,
        supervisor: row.supervisor || undefined,
        isActive: true,
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingMember(null);
    setIsManualSupervisor(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      position: member.position || '',
      squad: member.squad || '',
      supervisor: member.supervisor || '',
      employmentStatus: member.employmentStatus || 'Permanent',
      isActive: member.isActive,
    });
    // If current supervisor is not a team member, default to manual
    if (member.supervisor && !teamMembers.some(m => m.name === member.supervisor)) {
      setIsManualSupervisor(true);
    } else {
      setIsManualSupervisor(false);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const memberData = {
        name: formData.name,
        email: formData.email || undefined,
        position: formData.position || undefined,
        squad: formData.squad || undefined,
        supervisor: formData.supervisor || undefined,
        employmentStatus: formData.employmentStatus as 'Permanent' | 'Contract' | 'Freelance' | 'Vendor' || undefined,
        isActive: formData.isActive,
      };

      if (editingMember) {
        await updateTeamMember(editingMember.id, memberData);
        toast({ title: 'Berhasil', description: 'Anggota tim berhasil diperbarui' });
      } else {
        await addTeamMember(memberData);
        toast({ title: 'Berhasil', description: 'Anggota tim baru berhasil ditambahkan' });
      }

      handleOpenChange(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan anggota tim', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeamMember(id);
      toast({ title: 'Dihapus', description: 'Anggota tim berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus anggota tim', variant: 'destructive' });
    }
  };

  const activeMembers = teamMembers.filter(m => m.isActive);
  const inactiveMembers = teamMembers.filter(m => !m.isActive);
  const currentMonth = format(new Date(), 'MMM yyyy');

  // Filter logic
  const filteredMembers = teamMembers.filter(member => {
    // Search by name
    if (searchName && !member.name.toLowerCase().includes(searchName.toLowerCase())) return false;

    // Filter by supervisor
    if (filterSupervisor !== 'all' && member.supervisor !== filterSupervisor) return false;

    // Filter by project
    if (filterProject !== 'all') {
      const memberAllocations = projectAllocations.filter(a =>
        a.teamMemberId === member.id &&
        a.month === currentMonth &&
        a.projectId === filterProject
      );
      if (memberAllocations.length === 0) return false;
    }

    // Filter by role
    if (filterRole && member.position !== filterRole) return false;

    return true;
  });

  // Dashboard logic: Count by role (position)
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    teamMembers.filter(m => m.isActive).forEach(m => {
      const role = m.position || 'Unknown';
      counts[role] = (counts[role] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]); // Sort by count desc
  }, [teamMembers]);

  const getMemberProjects = (memberId: string) => {
    const allocations = projectAllocations.filter(a => a.teamMemberId === memberId && a.month === currentMonth);
    return allocations.map(a => {
      const project = projects.find(p => p.id === a.projectId);
      return { ...a, projectName: project?.name || 'Unknown' };
    });
  };

  const getMemberLoad = (memberId: string) => {
    const allocations = projectAllocations.filter(a => a.teamMemberId === memberId && a.month === currentMonth);
    return allocations.reduce((sum, a) => sum + (a.allocationPercentage || 0), 0);
  };

  return (
    <Card className="card-shadow">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Manajemen Tim</h3>
              <p className="text-sm text-muted-foreground">Kelola anggota tim proyek</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CsvImport
              title="Import Data Tim"
              description="Import daftar anggota tim dari file CSV. Pastikan kolom sesuai dengan template."
              templateColumns={TEAM_CSV_COLUMNS}
              onImport={handleImportTeam}
              templateFileName="template_tim.csv"
            />
            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Anggota
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'Edit Anggota Tim' : 'Tambah Anggota Tim'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nama *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nama lengkap"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Posisi</Label>
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      placeholder="Project Manager, Developer, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Squad</Label>
                    <Select value={formData.squad || "none"} onValueChange={(v) => setFormData(prev => ({ ...prev, squad: v === "none" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Pilih squad" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {allSquads.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Supervisor</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setIsManualSupervisor(!isManualSupervisor)}
                      >
                        {isManualSupervisor ? 'Pilih dari daftar' : 'Input manual'}
                      </Button>
                    </div>
                    {isManualSupervisor ? (
                      <Input
                        value={formData.supervisor}
                        onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                        placeholder="Nama supervisor baru"
                      />
                    ) : (
                      <Select
                        value={formData.supervisor || "none"}
                        onValueChange={(v) => setFormData(prev => ({ ...prev, supervisor: v === "none" ? "" : v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="Pilih supervisor" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {allSupervisors.map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Status Kerja</Label>
                    <Select
                      value={formData.employmentStatus || "Permanent"}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, employmentStatus: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Pilih status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Status Aktif</Label>
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingMember ? 'Update Anggota' : 'Tambah Anggota'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Dashboard Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
          {roleCounts.map(([role, count]) => {
            const style = getRoleStyle(role);
            const Icon = style.icon;
            const isSelected = filterRole === role;

            return (
              <Card
                key={role}
                className={`p-2 border transition-all cursor-pointer hover:shadow-md ${style.bgColor} ${style.borderColor} ${isSelected ? 'ring-2 ring-primary shadow-md' : ''}`}
                onClick={() => setFilterRole(isSelected ? null : role)}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <Icon className={`h-5 w-5 mb-1 ${style.color}`} />
                  <span className={`text-[10px] font-medium uppercase tracking-wide truncate w-full px-1 ${style.color}`}>{role}</span>
                  <span className={`text-lg font-bold ${style.color}`}>{count}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
          <div className="w-full md:w-1/3 space-y-1">
            <Label className="text-[10px]">Cari Nama</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari anggota tim..."
                className="pl-8 h-8 text-xs"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-1/4 space-y-1">
            <Label className="text-[10px]">Proyek</Label>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Semua Proyek" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Proyek</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/4 space-y-1">
            <Label className="text-[10px]">Supervisor</Label>
            <Select value={filterSupervisor} onValueChange={setFilterSupervisor}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Semua Supervisor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Supervisor</SelectItem>
                {allSupervisors.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-auto pb-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                setSearchName('');
                setFilterProject('all');
                setFilterSupervisor('all');
                setFilterRole(null);
              }}
              disabled={!searchName && filterProject === 'all' && filterSupervisor === 'all' && !filterRole}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Badge variant="secondary">{activeMembers.length} Aktif</Badge>
          <Badge variant="outline">{inactiveMembers.length} Non-aktif</Badge>
          <div className="ml-auto text-xs text-muted-foreground self-center">
            Menampilkan {filteredMembers.length} anggota
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Proyek ({currentMonth})</TableHead>
                <TableHead className="text-center">Load</TableHead>
                <TableHead>Squad</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Status Kerja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const memberProjects = getMemberProjects(member.id);
                const totalLoad = getMemberLoad(member.id);

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="font-medium whitespace-nowrap">{member.name}</div>
                      <div className="text-[10px] text-muted-foreground">{member.position || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 min-w-[120px]">
                        {memberProjects.length > 0 ? (
                          memberProjects.map((p) => (
                            <Badge
                              key={p.id}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-accent"
                              onClick={() => onNavigate?.('projects')}
                            >
                              {p.projectName.length > 15 ? p.projectName.substring(0, 15) + '...' : p.projectName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">No projects</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={totalLoad > 100 ? 'destructive' : totalLoad > 0 ? 'default' : 'outline'} className="text-[10px]">
                        {totalLoad}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] whitespace-nowrap">{member.squad || '-'}</Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">{member.supervisor || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {member.employmentStatus || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {member.isActive ? 'Aktif' : 'Non-aktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Belum ada anggota tim
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
