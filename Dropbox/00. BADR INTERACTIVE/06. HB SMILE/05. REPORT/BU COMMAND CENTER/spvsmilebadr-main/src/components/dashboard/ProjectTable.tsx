import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { formatCurrency } from '@/lib/mockData';

export function ProjectTable() {
  const { projects } = useData();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'default';
      case 'At Risk':
        return 'secondary';
      case 'Underperform':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20';
      case 'At Risk':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20';
      case 'Underperform':
        return 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20';
      default:
        return '';
    }
  };

  return (
    <Card className="card-shadow animate-fade-in">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Project GP Monitor</h3>
        <p className="text-sm text-muted-foreground">Track project performance and gross profit margins</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Actual Cost</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">GP %</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const gp = project.revenue - project.cogs;
              const gpPercent = ((gp / project.revenue) * 100).toFixed(1);
              const budgetVariance = ((project.actualCost / project.budget) * 100).toFixed(0);

              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(project.budget)}</TableCell>
                  <TableCell className="text-right">
                    <span className={Number(budgetVariance) > 100 ? 'text-destructive' : ''}>
                      {formatCurrency(project.actualCost)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(project.revenue)}</TableCell>
                  <TableCell className="text-right font-medium">{gpPercent}%</TableCell>
                  <TableCell className="text-center">
                    <Badge className={getStatusStyles(project.status)} variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
