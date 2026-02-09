import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/mockData';
import { Search, Trash2, RefreshCcw } from 'lucide-react';

export function DataTable() {
  const { monthlyData, surveyData, deleteMonthlyData, deleteSurveyData, refreshData } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    toast({ title: 'Refreshed', description: 'Data updated from database' });
  };

  const filteredMonthly = monthlyData.filter((d) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    // Specific check for month/year + generic object values
    return `${d.month} ${d.year}`.toLowerCase().includes(searchLower) ||
      Object.values(d).some(val => String(val).toLowerCase().includes(searchLower));
  });

  const filteredSurvey = surveyData.filter((d) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(d).some(val => String(val).toLowerCase().includes(searchLower));
  });

  const handleDeleteMonthly = async (id: string) => {
    try {
      await deleteMonthlyData(id);
      toast({ title: 'Dihapus', description: 'Data bulanan berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus data', variant: 'destructive' });
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      await deleteSurveyData(id);
      toast({ title: 'Dihapus', description: 'Data survey berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus data', variant: 'destructive' });
    }
  };

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Historical Data</h3>
          <p className="text-sm text-muted-foreground">Lihat dan kelola semua data historis</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="monthly">
          <TabsList className="mb-4">
            <TabsTrigger value="monthly">Monthly Financial</TabsTrigger>
            <TabsTrigger value="survey">Survey Results</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">OPEX</TableHead>
                    <TableHead className="text-right">COGS</TableHead>
                    <TableHead className="text-right">GP</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMonthly.map((d) => {
                    const gp = d.revenue - d.cogs;
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.month} {d.year}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.opex)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(d.cogs)}</TableCell>
                        <TableCell className="text-right font-medium text-success">{formatCurrency(gp)}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMonthly(d.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="survey">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-center">CSAT</TableHead>
                    <TableHead className="text-center">ESAT</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurvey.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.date}</TableCell>
                      <TableCell className="text-center">{d.csat}%</TableCell>
                      <TableCell className="text-center">{d.esat}%</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSurvey(d.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}
