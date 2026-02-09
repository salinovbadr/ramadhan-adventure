import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, User } from 'lucide-react';
import { format } from 'date-fns';

export function ProjectResourceMap() {
  const { projects, teamMembers, projectAllocations } = useData();
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  // Group allocations by project for current month
  const projectResources = projects.map(project => {
    const allocations = projectAllocations.filter(
      a => a.projectId === project.id && a.month === currentMonth
    );
    
    const members = allocations.map(a => {
      const member = teamMembers.find(m => m.id === a.teamMemberId);
      return {
        name: member?.name || 'Unknown',
        allocation: a.allocationPercentage,
        role: a.roleInProject,
      };
    });
    
    const totalAllocation = allocations.reduce((sum, a) => sum + a.allocationPercentage, 0);
    
    return {
      ...project,
      members,
      totalAllocation,
      memberCount: members.length,
    };
  }).filter(p => p.memberCount > 0);

  // Projects without allocation
  const unallocatedProjects = projects.filter(
    p => !projectResources.find(pr => pr.id === p.id)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Resource Map - {format(new Date(), 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projectResources.length === 0 && unallocatedProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Belum ada data project atau alokasi tim.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Projects with allocations */}
            {projectResources.map(project => (
              <div 
                key={project.id} 
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <Badge variant="outline">
                    {project.memberCount} anggota • {project.totalAllocation}% total
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                    >
                      <User className="h-3 w-3" />
                      <span>{member.name}</span>
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {member.allocation}%
                      </Badge>
                      {member.role && (
                        <span className="text-muted-foreground text-xs">
                          ({member.role})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Unallocated projects */}
            {unallocatedProjects.length > 0 && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Project tanpa alokasi bulan ini:
                </p>
                <div className="flex flex-wrap gap-2">
                  {unallocatedProjects.map(project => (
                    <Badge key={project.id} variant="outline" className="text-muted-foreground">
                      {project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
