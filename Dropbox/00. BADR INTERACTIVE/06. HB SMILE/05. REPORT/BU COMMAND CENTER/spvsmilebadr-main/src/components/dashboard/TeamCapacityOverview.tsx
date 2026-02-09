import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle, MinusCircle } from 'lucide-react';
import { format } from 'date-fns';

export function TeamCapacityOverview() {
  const { teamMembers, projectAllocations, projects } = useData();
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  // Calculate allocation per team member for current month
  const memberCapacity = teamMembers
    .filter(m => m.isActive)
    .map(member => {
      const allocations = projectAllocations.filter(
        a => a.teamMemberId === member.id && a.month === currentMonth
      );
      const totalAllocation = allocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
      const projectNames = allocations.map(a => {
        const project = projects.find(p => p.id === a.projectId);
        return project?.name || 'Unknown';
      });
      
      let status: 'overload' | 'optimal' | 'available' | 'idle';
      if (totalAllocation > 100) status = 'overload';
      else if (totalAllocation >= 80) status = 'optimal';
      else if (totalAllocation > 0) status = 'available';
      else status = 'idle';
      
      return {
        ...member,
        totalAllocation,
        projectNames,
        status,
      };
    });

  const overloaded = memberCapacity.filter(m => m.status === 'overload');
  const optimal = memberCapacity.filter(m => m.status === 'optimal');
  const available = memberCapacity.filter(m => m.status === 'available');
  const idle = memberCapacity.filter(m => m.status === 'idle');

  const getStatusBadge = (status: string, allocation: number) => {
    switch (status) {
      case 'overload':
        return <Badge variant="destructive">{allocation}%</Badge>;
      case 'optimal':
        return <Badge className="bg-green-500 hover:bg-green-600">{allocation}%</Badge>;
      case 'available':
        return <Badge variant="secondary">{allocation}%</Badge>;
      default:
        return <Badge variant="outline">0%</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kapasitas Tim - {format(new Date(), 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Overloaded */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Overload ({overloaded.length})</span>
            </div>
            <div className="space-y-1">
              {overloaded.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada</p>
              ) : (
                overloaded.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{m.name}</span>
                    {getStatusBadge(m.status, m.totalAllocation)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Optimal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Optimal ({optimal.length})</span>
            </div>
            <div className="space-y-1">
              {optimal.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada</p>
              ) : (
                optimal.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{m.name}</span>
                    {getStatusBadge(m.status, m.totalAllocation)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MinusCircle className="h-4 w-4" />
              <span className="font-medium">Available ({available.length})</span>
            </div>
            <div className="space-y-1">
              {available.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada</p>
              ) : (
                available.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{m.name}</span>
                    {getStatusBadge(m.status, m.totalAllocation)}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Idle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-500">
              <MinusCircle className="h-4 w-4" />
              <span className="font-medium">Idle ({idle.length})</span>
            </div>
            <div className="space-y-1">
              {idle.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada</p>
              ) : (
                idle.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{m.name}</span>
                    {getStatusBadge(m.status, m.totalAllocation)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
