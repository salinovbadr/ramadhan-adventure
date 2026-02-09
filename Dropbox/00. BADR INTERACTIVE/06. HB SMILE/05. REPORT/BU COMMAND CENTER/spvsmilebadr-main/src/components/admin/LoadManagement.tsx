import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, ChevronLeft, ChevronRight, Calendar,
  BarChart3, Clock, AlertCircle, CheckCircle2, Trash2, Settings, Pencil,
  Search, TrendingUp, Info, ChevronDown, ChevronUp, Users, Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, addMonths, subMonths, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import type { DailyTask } from '@/lib/mockData';
import { useSquads } from '@/hooks/useSquads';

const ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'Data Analyst',
  'Data Engineer',
  'Project Manager',
  'Software Tester',
  'System Analyst',
  'UI/UX Designer',
  'IT Helpdesk & Training Support',
  'Technical Writer',
  'Infra, Security, DevOps',
  'WMS'
];

// Generate colors for tasks based on project
const getTaskColor = (taskName: string) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-yellow-100 text-yellow-800 border-yellow-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
  ];
  const hash = taskName.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  return colors[Math.abs(hash) % colors.length];
};

const MONTHS_LIST = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface LoadManagementProps {
  onNavigate?: (tab: string) => void;
}

export function LoadManagement({ onNavigate }: LoadManagementProps) {
  const { teamMembers, projects, dailyTasks, projectAllocations, addDailyTask, deleteDailyTask, updateTeamMember } = useData();
  const { squads, addSquad, updateSquad, deleteSquad } = useSquads();

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterSquad, setFilterSquad] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ memberId: string; date: Date } | null>(null);
  const [newTask, setNewTask] = useState({ taskName: '', projectId: '', duration: 1, notes: '' });
  const [allocationYear, setAllocationYear] = useState(new Date().getFullYear());
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);

  // Squad management state
  const [isSquadManageOpen, setIsSquadManageOpen] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [editingSquad, setEditingSquad] = useState<{ id: string; name: string } | null>(null);

  // Get days of selected month
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get unique squads from team members and merge with database squads
  const allSquads = useMemo(() => {
    const dbSquadNames = squads.map(s => s.name);
    const teamSquads = teamMembers.map(m => m.squad).filter(Boolean) as string[];
    const combined = [...new Set([...dbSquadNames, ...teamSquads])];
    return combined.sort();
  }, [teamMembers, squads]);

  // Filter active team members
  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter(m => m.isActive)
      .filter(m => filterRole === 'all' || m.position === filterRole)
      .filter(m => filterSquad === 'all' || m.squad === filterSquad)
      .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const roleOrder = ROLES.indexOf(a.position || '') - ROLES.indexOf(b.position || '');
        if (roleOrder !== 0) return roleOrder;
        return a.name.localeCompare(b.name);
      });
  }, [teamMembers, filterRole, filterSquad]);

  // Get tasks for a specific member and date
  const getTasksForCell = (memberId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dailyTasks.filter(t => t.teamMemberId === memberId && t.taskDate === dateStr);
  };

  // Calculate load analysis for each member
  const memberAnalysis = useMemo(() => {
    const workingDays = daysInMonth.filter(d => !isWeekend(d)).length;

    return filteredMembers.map(member => {
      const memberTasks = dailyTasks.filter(
        t => t.teamMemberId === member.id &&
          t.taskDate >= format(monthStart, 'yyyy-MM-dd') &&
          t.taskDate <= format(monthEnd, 'yyyy-MM-dd')
      );

      const daysWithTasks = new Set(memberTasks.map(t => t.taskDate)).size;
      const idleDays = workingDays - daysWithTasks;

      // Find idle periods
      const idlePeriods: { start: Date; end: Date }[] = [];
      let periodStart: Date | null = null;

      daysInMonth.forEach((day, idx) => {
        if (isWeekend(day)) return;

        const dateStr = format(day, 'yyyy-MM-dd');
        const hasTask = memberTasks.some(t => t.taskDate === dateStr);

        if (!hasTask && !periodStart) {
          periodStart = day;
        } else if (hasTask && periodStart) {
          idlePeriods.push({ start: periodStart, end: daysInMonth[idx - 1] });
          periodStart = null;
        }
      });

      if (periodStart) {
        idlePeriods.push({ start: periodStart, end: monthEnd });
      }

      // Task summary
      const taskCounts: Record<string, { count: number, hours: number }> = {};
      memberTasks.forEach(t => {
        if (!taskCounts[t.taskName]) {
          taskCounts[t.taskName] = { count: 0, hours: 0 };
        }
        taskCounts[t.taskName].count += 1;
        taskCounts[t.taskName].hours += t.duration || 0;
      });

      const totalHours = memberTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      const utilizationRate = workingDays > 0 ? Math.round((totalHours / (workingDays * 8)) * 100) : 0;

      // Get planned allocation for this month from projectAllocations
      const currentMonthStr = format(selectedMonth, 'MMM yyyy');
      const plannedAllocation = projectAllocations
        .filter(a => a.teamMemberId === member.id && a.month === currentMonthStr)
        .reduce((sum, a) => sum + a.allocationPercentage, 0);

      return {
        member,
        daysWithTasks,
        idleDays,
        idlePeriods,
        taskCounts,
        utilizationRate,
        totalHours,
        plannedAllocation,
      };
    });
  }, [filteredMembers, dailyTasks, daysInMonth, monthStart, monthEnd, projectAllocations, selectedMonth]);

  // HPP & OPEX Load Calculation based on project allocations
  const allocationLoadData = useMemo(() => {
    const yearStr = allocationYear.toString();

    // Get all active team members with their allocations
    const membersWithAllocations = teamMembers
      .filter(m => m.isActive)
      .map(member => {
        // Get all allocations for this member in the selected year
        const memberAllocations = projectAllocations.filter(
          a => a.teamMemberId === member.id && a.month.includes(yearStr)
        );

        // Determine cost type from most recent allocation or default to 'hpp'
        const latestAllocation = memberAllocations.sort((a, b) => b.month.localeCompare(a.month))[0];
        const costType = latestAllocation?.costType || 'hpp';

        // Build monthly allocation map (sum of allocation percentages per month)
        const monthlyLoad: Record<string, number> = {};
        MONTHS_LIST.forEach(month => {
          const monthKey = `${month} ${yearStr}`;
          const monthAllocations = memberAllocations.filter(a => a.month === monthKey);
          monthlyLoad[month] = monthAllocations.reduce((sum, a) => sum + (a.allocationPercentage / 100), 0);
        });

        // Calculate total allocation across all months
        const totalMonths = Object.values(monthlyLoad).reduce((sum, val) => sum + val, 0);

        return {
          member,
          costType,
          monthlyLoad,
          totalMonths,
        };
      })
      .filter(m => (m.totalMonths > 0 || projectAllocations.some(a => a.teamMemberId === m.member.id)) &&
        m.member.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // Sort by role first, then by name
        const roleOrder = ROLES.indexOf(a.member.position || '') - ROLES.indexOf(b.member.position || '');
        if (roleOrder !== 0) return roleOrder;
        return a.member.name.localeCompare(b.member.name);
      });

    // Separate HPP and OPEX members
    const hppMembers = membersWithAllocations.filter(m => m.costType === 'hpp');
    const opexMembers = membersWithAllocations.filter(m => m.costType === 'opex');

    // Calculate monthly totals
    const hppMonthlyTotals: Record<string, number> = {};
    const opexMonthlyTotals: Record<string, number> = {};

    MONTHS_LIST.forEach(month => {
      hppMonthlyTotals[month] = hppMembers.reduce((sum, m) => sum + m.monthlyLoad[month], 0);
      opexMonthlyTotals[month] = opexMembers.reduce((sum, m) => sum + m.monthlyLoad[month], 0);
    });

    return {
      hppMembers,
      opexMembers,
      hppMonthlyTotals,
      opexMonthlyTotals,
      totalHppMembers: hppMembers.length,
      totalOpexMembers: opexMembers.length,
    };
  }, [teamMembers, projectAllocations, allocationYear, searchQuery]);



  const handleAddTask = async () => {
    if (!selectedCell || !newTask.taskName) {
      toast.error('Nama task harus diisi');
      return;
    }

    try {
      await addDailyTask({
        teamMemberId: selectedCell.memberId,
        taskDate: format(selectedCell.date, 'yyyy-MM-dd'),
        taskName: newTask.taskName,
        projectId: newTask.projectId || undefined,
        duration: newTask.duration,
        notes: newTask.notes || undefined,
      });
      toast.success('Task berhasil ditambahkan');
      setNewTask({ taskName: '', projectId: '', duration: 1, notes: '' });
      setIsAddTaskOpen(false);
      setSelectedCell(null);
    } catch (error) {
      toast.error('Gagal menambahkan task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDailyTask(taskId);
      toast.success('Task dihapus');
    } catch (error) {
      toast.error('Gagal menghapus task');
    }
  };

  const handleCellClick = (memberId: string, date: Date) => {
    if (isWeekend(date)) return;
    setSelectedCell({ memberId, date });
    setIsAddTaskOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Load Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-32 text-center font-medium">
                {format(selectedMonth, 'MMMM yyyy', { locale: id })}
              </span>
              <Button variant="outline" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label>Role:</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Squad:</Label>
              <Select value={filterSquad} onValueChange={setFilterSquad}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Squad</SelectItem>
                  {allSquads.map(squad => (
                    <SelectItem key={squad} value={squad}>{squad}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari nama anggota..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Dialog open={isSquadManageOpen} onOpenChange={setIsSquadManageOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Kelola Squad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Kelola Squad</DialogTitle>
                  <DialogDescription>
                    Tambah, edit, atau hapus squad untuk pengelompokan tim.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newSquadName}
                      onChange={e => setNewSquadName(e.target.value)}
                      placeholder="Nama squad baru"
                    />
                    <Button
                      onClick={async () => {
                        if (newSquadName) {
                          await addSquad(newSquadName);
                          setNewSquadName('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {squads.map(squad => (
                      <div key={squad.id} className="flex items-center justify-between p-2 border rounded">
                        {editingSquad?.id === squad.id ? (
                          <Input
                            value={editingSquad.name}
                            onChange={e => setEditingSquad({ ...editingSquad, name: e.target.value })}
                            className="flex-1 mr-2"
                          />
                        ) : (
                          <span>{squad.name}</span>
                        )}
                        <div className="flex gap-1">
                          {editingSquad?.id === squad.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={async () => {
                                  if (editingSquad.name && editingSquad.name !== squad.name) {
                                    await updateSquad(squad.id, editingSquad.name);
                                  }
                                  setEditingSquad(null);
                                }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingSquad({ id: squad.id, name: squad.name })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSquad(squad.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {squads.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        Belum ada squad. Tambahkan squad baru.
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar Grid</span>
            <span className="sm:hidden">Grid</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Load Analysis</span>
            <span className="sm:hidden">Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="projection" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Projection</span>
            <span className="sm:hidden">Proj</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Task Calendar Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full border-collapse text-sm" style={{ minWidth: `${480 + daysInMonth.length * 80}px` }}>
                  <thead className="sticky top-0 z-10 bg-muted">
                    <tr>
                      <th className="sticky left-0 z-20 bg-muted border-b border-r p-2 text-left min-w-24">Role</th>
                      <th className="sticky left-24 z-20 bg-muted border-b border-r p-2 text-left min-w-40">Nama</th>
                      <th className="sticky left-64 z-20 bg-muted border-b border-r p-2 text-left min-w-24">Squad</th>
                      <th className="sticky left-[352px] z-20 bg-muted border-b border-r p-2 text-left min-w-28">Supervisor</th>
                      {daysInMonth.map(day => (
                        <th
                          key={day.toISOString()}
                          className={`border-b border-r p-1 text-center min-w-20 ${isWeekend(day) ? 'bg-muted/50' : ''}`}
                        >
                          <div className="text-xs text-muted-foreground">
                            {format(day, 'EEE', { locale: id })}
                          </div>
                          <div className={isWeekend(day) ? 'text-muted-foreground' : ''}>
                            {format(day, 'd')}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-muted/30">
                        <td className="sticky left-0 z-10 bg-background border-b border-r p-2 text-xs font-medium">
                          {member.position || '-'}
                        </td>
                        <td className="sticky left-24 z-10 bg-background border-b border-r p-2">
                          <div
                            className="font-medium cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onNavigate?.('team')}
                          >
                            {member.name}
                          </div>
                        </td>
                        <td className="sticky left-64 z-10 bg-background border-b border-r p-2">
                          <Badge variant="outline" className="text-xs">
                            {member.squad || '-'}
                          </Badge>
                        </td>
                        <td className="sticky left-[352px] z-10 bg-background border-b border-r p-2 text-xs">
                          {member.supervisor || '-'}
                        </td>
                        {daysInMonth.map(day => {
                          const tasks = getTasksForCell(member.id, day);
                          const isWeekendDay = isWeekend(day);

                          return (
                            <td
                              key={day.toISOString()}
                              className={`border-b border-r p-1 align-top min-h-12 ${isWeekendDay ? 'bg-muted/30' : 'cursor-pointer hover:bg-accent/50'
                                }`}
                              onClick={() => !isWeekendDay && handleCellClick(member.id, day)}
                            >
                              {tasks.length > 0 ? (
                                <div className="space-y-1">
                                  {tasks.slice(0, 2).map(task => (
                                    <Popover key={task.id}>
                                      <PopoverTrigger asChild>
                                        <div
                                          className={`text-xs p-1 rounded border truncate cursor-pointer ${getTaskColor(task.taskName)}`}
                                          onClick={e => e.stopPropagation()}
                                        >
                                          {task.taskName.length > 15
                                            ? task.taskName.substring(0, 15) + '...'
                                            : task.taskName} ({task.duration}h)
                                        </div>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-64">
                                        <div className="space-y-2">
                                          <div className="font-medium">{task.taskName} ({task.duration} jam)</div>
                                          {task.notes && (
                                            <p className="text-sm text-muted-foreground">{task.notes}</p>
                                          )}
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteTask(task.id)}
                                          >
                                            <Trash2 className="h-3 w-3 mr-1" /> Hapus
                                          </Button>
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  ))}
                                  {tasks.length > 2 && (
                                    <div className="text-xs text-muted-foreground text-center">
                                      +{tasks.length - 2} lainnya
                                    </div>
                                  )}
                                </div>
                              ) : !isWeekendDay ? (
                                <div className="h-8 flex items-center justify-center opacity-0 hover:opacity-100">
                                  <Plus className="h-3 w-3 text-muted-foreground" />
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    {filteredMembers.length === 0 && (
                      <tr>
                        <td colSpan={daysInMonth.length + 4} className="p-8 text-center text-muted-foreground">
                          Tidak ada anggota tim yang sesuai pencarian/filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Load Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analisis Load Tim - {format(selectedMonth, 'MMMM yyyy', { locale: id })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memberAnalysis.map(({ member, daysWithTasks, idleDays, idlePeriods, taskCounts, utilizationRate, totalHours, plannedAllocation }) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{member.name}</span>
                          <Badge variant="outline">{member.position}</Badge>
                          {member.squad && <Badge variant="secondary">{member.squad}</Badge>}
                        </div>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {daysWithTasks} hari aktif
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            {idleDays} hari idle
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {totalHours} Jam
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            {utilizationRate}% utilization (Actual)
                          </span>
                          <span className="flex items-center gap-1 border-l pl-4">
                            <Calendar className="h-4 w-4" />
                            {plannedAllocation}% planned (Alokasi)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {utilizationRate > 100 ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Overload
                          </Badge>
                        ) : utilizationRate < 50 && totalHours > 0 ? (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                            Underload
                          </Badge>
                        ) : null}
                        {Math.abs(utilizationRate - plannedAllocation) > 30 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Discrepancy
                          </Badge>
                        )}
                        {utilizationRate >= 80 ? (
                          <Badge className="bg-green-500">High Load</Badge>
                        ) : utilizationRate >= 50 ? (
                          <Badge className="bg-yellow-500">Medium Load</Badge>
                        ) : (
                          <Badge variant="destructive">Low Load</Badge>
                        )}
                      </div>
                    </div>

                    {/* Task Summary */}
                    {Object.keys(taskCounts).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2">Rekap Task ({totalHours} Jam):</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(taskCounts).slice(0, 5).map(([name, data]) => (
                            <Badge key={name} variant="outline" className={getTaskColor(name)}>
                              {name} ({data.hours}h)
                            </Badge>
                          ))}
                          {Object.keys(taskCounts).length > 5 && (
                            <Badge variant="outline">+{Object.keys(taskCounts).length - 5} lainnya</Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Idle Periods */}
                    {idlePeriods.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Periode Idle:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {idlePeriods.slice(0, 4).map((period, idx) => (
                            <Badge key={idx} variant="secondary">
                              {format(period.start, 'd MMM', { locale: id })}
                              {!isSameDay(period.start, period.end) && ` - ${format(period.end, 'd MMM', { locale: id })}`}
                            </Badge>
                          ))}
                          {idlePeriods.length > 4 && (
                            <Badge variant="outline">+{idlePeriods.length - 4} periode lainnya</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {memberAnalysis.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Tidak ada anggota tim yang sesuai pencarian/filter
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          {/* HPP & OPEX Load Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Proyeksi Alokasi Tim - HPP & OPEX Load
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label>Tahun:</Label>
                  <Select value={allocationYear.toString()} onValueChange={(v) => setAllocationYear(parseInt(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Dashboard Mini - Collapsible */}
              <div className="border-b bg-muted/30">
                <button
                  onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
                  className="w-full px-6 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Load Dashboard Summary</h3>
                    <Badge variant="outline" className="ml-2">
                      {allocationYear}
                    </Badge>
                  </div>
                  {isDashboardExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {isDashboardExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* HPP Staff Count */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card className="cursor-help">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total HPP Staff</p>
                                    <p className="text-2xl font-bold text-green-600">
                                      {allocationLoadData.totalHppMembers}
                                    </p>
                                  </div>
                                  <Users className="h-8 w-8 text-green-600 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Jumlah total staff dengan kategori HPP (Harga Pokok Penjualan) yang aktif dalam sistem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* OPEX Staff Count */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Card className="cursor-help">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Total OPEX Staff</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                      {allocationLoadData.totalOpexMembers}
                                    </p>
                                  </div>
                                  <Users className="h-8 w-8 text-blue-600 opacity-50" />
                                </div>
                              </CardContent>
                            </Card>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Jumlah total staff dengan kategori OPEX (Operational Expenditure) yang aktif dalam sistem</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Avg HPP Load */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Avg HPP Load</p>
                              <p className="text-2xl font-bold">
                                {allocationLoadData.totalHppMembers > 0
                                  ? (allocationLoadData.hppMembers.reduce((sum, m) => sum + m.totalMonths, 0) /
                                    allocationLoadData.totalHppMembers).toFixed(2)
                                  : '0.00'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(() => {
                                  const avg = allocationLoadData.totalHppMembers > 0
                                    ? allocationLoadData.hppMembers.reduce((sum, m) => sum + m.totalMonths, 0) /
                                    allocationLoadData.totalHppMembers
                                    : 0;
                                  return avg >= 0.9 ? '⚠️ Near capacity' : avg >= 0.7 ? '✅ Good' : '📊 Available';
                                })()}
                              </p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Avg OPEX Load */}
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Avg OPEX Load</p>
                              <p className="text-2xl font-bold">
                                {allocationLoadData.totalOpexMembers > 0
                                  ? (allocationLoadData.opexMembers.reduce((sum, m) => sum + m.totalMonths, 0) /
                                    allocationLoadData.totalOpexMembers).toFixed(2)
                                  : '0.00'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {(() => {
                                  const avg = allocationLoadData.totalOpexMembers > 0
                                    ? allocationLoadData.opexMembers.reduce((sum, m) => sum + m.totalMonths, 0) /
                                    allocationLoadData.totalOpexMembers
                                    : 0;
                                  return avg >= 0.9 ? '⚠️ Near capacity' : avg >= 0.7 ? '✅ Good' : '📊 Available';
                                })()}
                              </p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600 opacity-50" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Monthly Totals Table - Compact View */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Total Load per Bulan ({allocationYear})</CardTitle>
                          <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-muted-foreground">&lt;70%</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-muted-foreground">70-90%</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-muted-foreground">&gt;90%</span>
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium">Bulan</th>
                                <th className="text-right py-2 px-3 font-medium text-green-600">HPP</th>
                                <th className="text-center py-2 px-3 font-medium text-green-600">Capacity</th>
                                <th className="text-right py-2 px-3 font-medium text-blue-600">OPEX</th>
                                <th className="text-center py-2 px-3 font-medium text-blue-600">Capacity</th>
                                <th className="text-right py-2 px-3 font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MONTHS_LIST.map(month => {
                                const hppTotal = allocationLoadData.hppMonthlyTotals[month];
                                const opexTotal = allocationLoadData.opexMonthlyTotals[month];
                                const hppPercentage = allocationLoadData.totalHppMembers > 0
                                  ? (hppTotal / allocationLoadData.totalHppMembers) * 100
                                  : 0;
                                const opexPercentage = allocationLoadData.totalOpexMembers > 0
                                  ? (opexTotal / allocationLoadData.totalOpexMembers) * 100
                                  : 0;

                                const hppColor = hppPercentage >= 90 ? 'bg-red-500' :
                                  hppPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500';
                                const opexColor = opexPercentage >= 90 ? 'bg-red-500' :
                                  opexPercentage >= 70 ? 'bg-yellow-500' : 'bg-blue-500';

                                return (
                                  <tr key={month} className="border-b hover:bg-muted/50">
                                    <td className="py-2 px-3 font-medium">{month}</td>
                                    <td className="py-2 px-3 text-right font-mono">{hppTotal.toFixed(2)}</td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full transition-all ${hppColor}`}
                                            style={{ width: `${Math.min(hppPercentage, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium w-10 text-right">
                                          {hppPercentage.toFixed(0)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono">{opexTotal.toFixed(2)}</td>
                                    <td className="py-2 px-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                          <div
                                            className={`h-full transition-all ${opexColor}`}
                                            style={{ width: `${Math.min(opexPercentage, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium w-10 text-right">
                                          {opexPercentage.toFixed(0)}%
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold">
                                      {(hppTotal + opexTotal).toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              })}
                              <tr className="font-bold bg-muted/30">
                                <td className="py-2 px-3">TOTAL</td>
                                <td className="py-2 px-3 text-right text-green-600">
                                  {Object.values(allocationLoadData.hppMonthlyTotals).reduce((a, b) => a + b, 0).toFixed(2)}
                                </td>
                                <td className="py-2 px-3"></td>
                                <td className="py-2 px-3 text-right text-blue-600">
                                  {Object.values(allocationLoadData.opexMonthlyTotals).reduce((a, b) => a + b, 0).toFixed(2)}
                                </td>
                                <td className="py-2 px-3"></td>
                                <td className="py-2 px-3 text-right">
                                  {(Object.values(allocationLoadData.hppMonthlyTotals).reduce((a, b) => a + b, 0) +
                                    Object.values(allocationLoadData.opexMonthlyTotals).reduce((a, b) => a + b, 0)).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Highest Load Month</p>
                            <p className="font-semibold">
                              {(() => {
                                const monthTotals = MONTHS_LIST.map(m => ({
                                  month: m,
                                  total: allocationLoadData.hppMonthlyTotals[m] + allocationLoadData.opexMonthlyTotals[m]
                                }));
                                const highest = monthTotals.reduce((max, curr) => curr.total > max.total ? curr : max);
                                return `${highest.month}: ${highest.total.toFixed(2)}`;
                              })()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Over-Capacity Months</p>
                            <p className="font-semibold">
                              {(() => {
                                const overCapacity = MONTHS_LIST.filter(m => {
                                  const hppPct = allocationLoadData.totalHppMembers > 0
                                    ? (allocationLoadData.hppMonthlyTotals[m] / allocationLoadData.totalHppMembers) * 100
                                    : 0;
                                  const opexPct = allocationLoadData.totalOpexMembers > 0
                                    ? (allocationLoadData.opexMonthlyTotals[m] / allocationLoadData.totalOpexMembers) * 100
                                    : 0;
                                  return hppPct >= 90 || opexPct >= 90;
                                });
                                return overCapacity.length > 0
                                  ? `⚠️ ${overCapacity.length} bulan (${overCapacity.join(', ')})`
                                  : '✅ None';
                              })()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <ScrollArea className="w-full">
                <div className="overflow-auto">
                  <div className="min-w-[1000px]">
                    {/* HPP Load Table */}
                    <div className="border-b">
                      <div className="bg-green-50 dark:bg-green-950 px-4 py-2 border-b">
                        <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                          HPP Load ({allocationLoadData.totalHppMembers} orang)
                        </h4>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="border-r p-2 text-left font-medium min-w-40">Nama Lengkap</th>
                            <th className="border-r p-2 text-left font-medium min-w-32">Role</th>
                            <th className="border-r p-2 text-left font-medium min-w-20">Category</th>
                            <th className="border-r p-2 text-left font-medium min-w-20">Squad</th>
                            <th className="border-r p-2 text-left font-medium min-w-28">Supervisor</th>
                            <th className="border-r p-2 text-center font-medium min-w-16">Projects</th>
                            {MONTHS_LIST.map(month => (
                              <th key={month} className="border-r p-2 text-center font-medium min-w-12">{month}</th>
                            ))}
                            <th className="p-2 text-center font-medium min-w-12">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocationLoadData.hppMembers.map((item, idx) => (
                            <tr key={item.member.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="border-r p-2 font-medium">{item.member.name}</td>
                              <td className="border-r p-2">{item.member.position || '-'}</td>
                              <td className="border-r p-2">
                                <Badge variant="default" className="bg-green-600">HPP</Badge>
                              </td>
                              <td className="border-r p-2">{item.member.squad || '-'}</td>
                              <td className="border-r p-2">{item.member.supervisor || '-'}</td>
                              <td className="border-r p-2 text-center">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Info className="h-4 w-4 text-primary" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm">Project Allocations - {allocationYear}</div>
                                      {(() => {
                                        const memberAllocations = projectAllocations.filter(
                                          a => a.teamMemberId === item.member.id &&
                                            a.month.includes(allocationYear.toString()) &&
                                            a.costType === 'hpp'
                                        );

                                        if (memberAllocations.length === 0) {
                                          return <div className="text-sm text-muted-foreground">No project allocations</div>;
                                        }

                                        const groupedByProject = memberAllocations.reduce((acc, alloc) => {
                                          const projId = alloc.projectId || 'OPEX';
                                          if (!acc[projId]) acc[projId] = [];
                                          acc[projId].push(alloc);
                                          return acc;
                                        }, {} as Record<string, typeof memberAllocations>);

                                        return (
                                          <div className="space-y-3">
                                            {Object.entries(groupedByProject).map(([projId, allocs]) => (
                                              <div key={projId} className="border-b pb-2 last:border-0">
                                                <div className="font-medium text-sm mb-1">
                                                  {projId === 'OPEX' ? 'OPEX' : projects.find(p => p.id === projId)?.name || projId}
                                                </div>
                                                <div className="space-y-1">
                                                  {allocs.map(alloc => (
                                                    <div key={alloc.id} className="flex justify-between text-xs text-muted-foreground">
                                                      <span>{alloc.month}</span>
                                                      <Badge variant="outline" className="text-xs">{alloc.allocationPercentage}%</Badge>
                                                    </div>
                                                  ))}
                                                  <div className="flex justify-between text-xs font-medium pt-1 border-t">
                                                    <span>Total:</span>
                                                    <span>{allocs.reduce((sum, a) => sum + a.allocationPercentage, 0)}%</span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </td>
                              {MONTHS_LIST.map(month => (
                                <td
                                  key={month}
                                  className={`border-r p-2 text-center ${item.monthlyLoad[month] > 0
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}
                                >
                                  {item.monthlyLoad[month].toFixed(2)}
                                </td>
                              ))}
                              <td className="p-2 text-center font-bold">{item.totalMonths.toFixed(2)}</td>
                            </tr>
                          ))}
                          {allocationLoadData.hppMembers.length === 0 && (
                            <tr>
                              <td colSpan={17} className="p-4 text-center text-muted-foreground">
                                Tidak ada data alokasi HPP untuk kriteria yang dipilih
                              </td>
                            </tr>
                          )}

                        </tbody>
                      </table>
                    </div>

                    {/* OPEX Load Table */}
                    <div>
                      <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 border-b">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                          OPEX Load ({allocationLoadData.totalOpexMembers} orang)
                        </h4>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="border-r p-2 text-left font-medium min-w-40">Nama Lengkap</th>
                            <th className="border-r p-2 text-left font-medium min-w-32">Role</th>
                            <th className="border-r p-2 text-left font-medium min-w-20">Category</th>
                            <th className="border-r p-2 text-left font-medium min-w-20">Squad</th>
                            <th className="border-r p-2 text-left font-medium min-w-28">Supervisor</th>
                            <th className="border-r p-2 text-center font-medium min-w-16">Projects</th>
                            {MONTHS_LIST.map(month => (
                              <th key={month} className="border-r p-2 text-center font-medium min-w-12">{month}</th>
                            ))}
                            <th className="p-2 text-center font-medium min-w-12">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocationLoadData.opexMembers.map((item, idx) => (
                            <tr key={item.member.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                              <td className="border-r p-2 font-medium">{item.member.name}</td>
                              <td className="border-r p-2">{item.member.position || '-'}</td>
                              <td className="border-r p-2">
                                <Badge variant="secondary" className="bg-blue-600 text-white">OPEX</Badge>
                              </td>
                              <td className="border-r p-2">{item.member.squad || '-'}</td>
                              <td className="border-r p-2">{item.member.supervisor || '-'}</td>
                              <td className="border-r p-2 text-center">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <Info className="h-4 w-4 text-blue-600" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-sm">Project Allocations - {allocationYear}</div>
                                      {(() => {
                                        const memberAllocations = projectAllocations.filter(
                                          a => a.teamMemberId === item.member.id &&
                                            a.month.includes(allocationYear.toString()) &&
                                            a.costType === 'opex'
                                        );

                                        if (memberAllocations.length === 0) {
                                          return <div className="text-sm text-muted-foreground">No project allocations</div>;
                                        }

                                        const groupedByProject = memberAllocations.reduce((acc, alloc) => {
                                          const projId = alloc.projectId || 'OPEX';
                                          if (!acc[projId]) acc[projId] = [];
                                          acc[projId].push(alloc);
                                          return acc;
                                        }, {} as Record<string, typeof memberAllocations>);

                                        return (
                                          <div className="space-y-3">
                                            {Object.entries(groupedByProject).map(([projId, allocs]) => (
                                              <div key={projId} className="border-b pb-2 last:border-0">
                                                <div className="font-medium text-sm mb-1">
                                                  {projId === 'OPEX' ? 'OPEX' : projects.find(p => p.id === projId)?.name || projId}
                                                </div>
                                                <div className="space-y-1">
                                                  {allocs.map(alloc => (
                                                    <div key={alloc.id} className="flex justify-between text-xs text-muted-foreground">
                                                      <span>{alloc.month}</span>
                                                      <Badge variant="outline" className="text-xs">{alloc.allocationPercentage}%</Badge>
                                                    </div>
                                                  ))}
                                                  <div className="flex justify-between text-xs font-medium pt-1 border-t">
                                                    <span>Total:</span>
                                                    <span>{allocs.reduce((sum, a) => sum + a.allocationPercentage, 0)}%</span>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </td>
                              {MONTHS_LIST.map(month => (
                                <td
                                  key={month}
                                  className={`border-r p-2 text-center ${item.monthlyLoad[month] > 0
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    }`}
                                >
                                  {item.monthlyLoad[month].toFixed(2)}
                                </td>
                              ))}
                              <td className="p-2 text-center font-bold">{item.totalMonths.toFixed(2)}</td>
                            </tr>
                          ))}
                          {allocationLoadData.opexMembers.length === 0 && (
                            <tr>
                              <td colSpan={17} className="p-4 text-center text-muted-foreground">
                                Tidak ada data alokasi OPEX untuk kriteria yang dipilih
                              </td>
                            </tr>
                          )}

                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-muted/30 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{allocationLoadData.totalHppMembers}</div>
                          <div className="text-sm text-muted-foreground">Total HPP</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{allocationLoadData.totalOpexMembers}</div>
                          <div className="text-sm text-muted-foreground">Total OPEX</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {allocationLoadData.totalHppMembers + allocationLoadData.totalOpexMembers}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Alokasi</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{allocationYear}</div>
                          <div className="text-sm text-muted-foreground">Tahun</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Task</DialogTitle>
          </DialogHeader>
          {selectedCell && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {teamMembers.find(m => m.id === selectedCell.memberId)?.name} - {format(selectedCell.date, 'd MMMM yyyy', { locale: id })}
              </div>

              <div className="space-y-2">
                <Label>Nama Task *</Label>
                <Input
                  value={newTask.taskName}
                  onChange={e => setNewTask(prev => ({ ...prev, taskName: e.target.value }))}
                  placeholder="Contoh: Dashboard Cold Storage (FE)"
                />
              </div>

              <div className="space-y-2">
                <Label>Proyek (Opsional)</Label>
                <Select
                  value={newTask.projectId || "none"}
                  onValueChange={v => setNewTask(prev => ({ ...prev, projectId: v === "none" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih proyek" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak ada</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Durasi (Jam) *</Label>
                  <span className="text-[10px] text-muted-foreground">Maks. 8 jam/hari</span>
                </div>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={newTask.duration}
                  onChange={e => setNewTask(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Catatan (Opsional)</Label>
                <Input
                  value={newTask.notes}
                  onChange={e => setNewTask(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Batal</Button>
                <Button onClick={handleAddTask}>Simpan</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}