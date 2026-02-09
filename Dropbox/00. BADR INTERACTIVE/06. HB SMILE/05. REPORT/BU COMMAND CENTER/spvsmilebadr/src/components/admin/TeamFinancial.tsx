import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Trash2, Pencil, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Wallet, Receipt, BarChart3, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatFullCurrency } from '@/lib/mockData';
import { useSquads } from '@/hooks/useSquads';

interface OpexBudget {
  id: string;
  description: string;
  squad: string | null;
  okr: string | null;
  kpi: string | null;
  account: string | null;
  year: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
}

interface OpexConsumption {
  id: string;
  opexBudgetId: string | null;
  quarter: string;
  year: number;
  allocationDescription: string;
  usageDescription: string | null;
  amount: number;
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_FULL_LABELS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

const transformOpexBudget = (row: any): OpexBudget => ({
  id: row.id,
  description: row.description,
  squad: row.squad,
  okr: row.okr,
  kpi: row.kpi,
  account: row.account,
  year: row.year,
  jan: Number(row.jan),
  feb: Number(row.feb),
  mar: Number(row.mar),
  apr: Number(row.apr),
  may: Number(row.may),
  jun: Number(row.jun),
  jul: Number(row.jul),
  aug: Number(row.aug),
  sep: Number(row.sep),
  oct: Number(row.oct),
  nov: Number(row.nov),
  dec: Number(row.dec),
});

const transformOpexConsumption = (row: any): OpexConsumption => ({
  id: row.id,
  opexBudgetId: row.opex_budget_id,
  quarter: row.quarter,
  year: row.year,
  allocationDescription: row.allocation_description,
  usageDescription: row.usage_description,
  amount: Number(row.amount),
});

// Status helper
const getStatusConfig = (percentage: number) => {
  if (percentage >= 100) return { color: 'bg-destructive', textColor: 'text-destructive', label: 'Over Budget', icon: AlertCircle };
  if (percentage >= 80) return { color: 'bg-warning', textColor: 'text-warning', label: 'Perhatian', icon: AlertTriangle };
  if (percentage >= 50) return { color: 'bg-accent', textColor: 'text-accent', label: 'Normal', icon: TrendingUp };
  return { color: 'bg-success', textColor: 'text-success', label: 'Baik', icon: CheckCircle2 };
};

export function TeamFinancial() {
  const { squads } = useSquads();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [opexBudgets, setOpexBudgets] = useState<OpexBudget[]>([]);
  const [opexConsumptions, setOpexConsumptions] = useState<OpexConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertsShown, setAlertsShown] = useState(false);
  
  // Add Budget Dialog
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<OpexBudget | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    description: '',
    squad: '',
    okr: '',
    kpi: '',
    account: '',
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
  });
  
  // Add Consumption Dialog
  const [isAddConsumptionOpen, setIsAddConsumptionOpen] = useState(false);
  const [editingConsumption, setEditingConsumption] = useState<OpexConsumption | null>(null);
  const [consumptionForm, setConsumptionForm] = useState({
    opexBudgetId: '',
    quarter: 'Q1',
    allocationDescription: '',
    usageDescription: '',
    amount: 0,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [budgetRes, consumptionRes] = await Promise.all([
        supabase.from('opex_budget').select('*').eq('year', selectedYear),
        supabase.from('opex_consumption').select('*').eq('year', selectedYear),
      ]);
      
      setOpexBudgets(budgetRes.data ? budgetRes.data.map(transformOpexBudget) : []);
      setOpexConsumptions(consumptionRes.data ? consumptionRes.data.map(transformOpexConsumption) : []);
      setAlertsShown(false);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching financial data:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate quarterly budget from monthly data
  const getQuarterlyBudget = (budget: OpexBudget, quarter: string) => {
    switch (quarter) {
      case 'Q1': return budget.jan + budget.feb + budget.mar;
      case 'Q2': return budget.apr + budget.may + budget.jun;
      case 'Q3': return budget.jul + budget.aug + budget.sep;
      case 'Q4': return budget.oct + budget.nov + budget.dec;
      default: return 0;
    }
  };

  // BAGIAN B: Rekap per kuartal per item
  const rekapPerItem = useMemo(() => {
    return opexBudgets.map(budget => {
      const quarters = QUARTERS.map(q => {
        const quarterBudget = getQuarterlyBudget(budget, q);
        const quarterConsumption = opexConsumptions
          .filter(c => c.opexBudgetId === budget.id && c.quarter === q)
          .reduce((sum, c) => sum + c.amount, 0);
        const remaining = quarterBudget - quarterConsumption;
        const percentage = quarterBudget > 0 ? Math.round((quarterConsumption / quarterBudget) * 100) : 0;
        
        return { quarter: q, budget: quarterBudget, consumption: quarterConsumption, remaining, percentage };
      });
      
      const totalBudget = quarters.reduce((sum, q) => sum + q.budget, 0);
      const totalConsumption = quarters.reduce((sum, q) => sum + q.consumption, 0);
      const totalPercentage = totalBudget > 0 ? Math.round((totalConsumption / totalBudget) * 100) : 0;
      
      return { budget, quarters, totalBudget, totalConsumption, totalPercentage };
    });
  }, [opexBudgets, opexConsumptions]);

  // BAGIAN C: Rekap ALL per kuartal
  const rekapAll = useMemo(() => {
    const result = QUARTERS.map(q => {
      const totalBudget = opexBudgets.reduce((sum, b) => sum + getQuarterlyBudget(b, q), 0);
      const totalConsumption = opexConsumptions
        .filter(c => c.quarter === q)
        .reduce((sum, c) => sum + c.amount, 0);
      const remaining = totalBudget - totalConsumption;
      const percentage = totalBudget > 0 ? Math.round((totalConsumption / totalBudget) * 100) : 0;
      
      return { quarter: q, budget: totalBudget, consumption: totalConsumption, remaining, percentage };
    });
    
    const yearlyBudget = result.reduce((sum, q) => sum + q.budget, 0);
    const yearlyConsumption = result.reduce((sum, q) => sum + q.consumption, 0);
    
    return {
      quarters: result,
      yearly: {
        budget: yearlyBudget,
        consumption: yearlyConsumption,
        remaining: yearlyBudget - yearlyConsumption,
        percentage: yearlyBudget > 0 ? Math.round((yearlyConsumption / yearlyBudget) * 100) : 0,
      },
    };
  }, [opexBudgets, opexConsumptions]);

  // Budget alerts
  const budgetAlerts = useMemo(() => {
    const alerts: { type: 'critical' | 'warning'; message: string; item: string }[] = [];
    
    rekapPerItem.forEach(item => {
      item.quarters.forEach(q => {
        if (q.percentage >= 100 && q.budget > 0) {
          alerts.push({
            type: 'critical',
            message: `${item.budget.description} telah melebihi budget ${q.quarter} (${q.percentage}%)`,
            item: item.budget.id,
          });
        } else if (q.percentage >= 80 && q.budget > 0) {
          alerts.push({
            type: 'warning',
            message: `${item.budget.description} mendekati batas budget ${q.quarter} (${q.percentage}%)`,
            item: item.budget.id,
          });
        }
      });
    });
    
    return alerts;
  }, [rekapPerItem]);

  // Show toast alerts
  useEffect(() => {
    if (!alertsShown && budgetAlerts.length > 0 && !isLoading) {
      const criticals = budgetAlerts.filter(a => a.type === 'critical');
      const warnings = budgetAlerts.filter(a => a.type === 'warning');
      
      if (criticals.length > 0) {
        toast.error(`⚠️ ${criticals.length} item OPEX melebihi budget!`, {
          description: criticals[0].message,
          duration: 8000,
        });
      } else if (warnings.length > 0) {
        toast.warning(`⚡ ${warnings.length} item OPEX mendekati batas budget`, {
          description: warnings[0].message,
          duration: 6000,
        });
      }
      setAlertsShown(true);
    }
  }, [budgetAlerts, alertsShown, isLoading]);

  // Calculate remaining budget per quarter for consumption form
  const getRemainingBudgetForQuarter = (budgetId: string, quarter: string) => {
    const budget = opexBudgets.find(b => b.id === budgetId);
    if (!budget) return 0;
    
    const quarterBudget = getQuarterlyBudget(budget, quarter);
    const used = opexConsumptions
      .filter(c => c.opexBudgetId === budgetId && c.quarter === quarter)
      .reduce((sum, c) => sum + c.amount, 0);
    
    return quarterBudget - used;
  };

  // Handle Budget CRUD
  const handleSaveBudget = async () => {
    if (!budgetForm.description) {
      toast.error('Deskripsi harus diisi');
      return;
    }
    
    try {
      const data = {
        description: budgetForm.description,
        squad: budgetForm.squad || null,
        okr: budgetForm.okr || null,
        kpi: budgetForm.kpi || null,
        account: budgetForm.account || null,
        year: selectedYear,
        ...MONTHS.reduce((acc, m) => ({ ...acc, [m]: budgetForm[m as keyof typeof budgetForm] }), {}),
      };
      
      if (editingBudget) {
        const { error } = await supabase.from('opex_budget').update(data).eq('id', editingBudget.id);
        if (error) throw error;
        toast.success('Budget berhasil diperbarui');
      } else {
        const { error } = await supabase.from('opex_budget').insert(data);
        if (error) throw error;
        toast.success('Budget berhasil ditambahkan');
      }
      
      setIsAddBudgetOpen(false);
      setEditingBudget(null);
      resetBudgetForm();
      fetchData();
    } catch (error) {
      toast.error('Gagal menyimpan budget');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      const { error } = await supabase.from('opex_budget').delete().eq('id', id);
      if (error) throw error;
      toast.success('Budget berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus budget');
    }
  };

  const handleEditBudget = (budget: OpexBudget) => {
    setEditingBudget(budget);
    setBudgetForm({
      description: budget.description,
      squad: budget.squad || '',
      okr: budget.okr || '',
      kpi: budget.kpi || '',
      account: budget.account || '',
      jan: budget.jan, feb: budget.feb, mar: budget.mar, apr: budget.apr,
      may: budget.may, jun: budget.jun, jul: budget.jul, aug: budget.aug,
      sep: budget.sep, oct: budget.oct, nov: budget.nov, dec: budget.dec,
    });
    setIsAddBudgetOpen(true);
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      description: '', squad: '', okr: '', kpi: '', account: '',
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
    });
  };

  // Handle Consumption CRUD
  const handleSaveConsumption = async () => {
    if (!consumptionForm.allocationDescription) {
      toast.error('Deskripsi alokasi harus diisi');
      return;
    }
    
    try {
      const data = {
        opex_budget_id: consumptionForm.opexBudgetId || null,
        quarter: consumptionForm.quarter,
        year: selectedYear,
        allocation_description: consumptionForm.allocationDescription,
        usage_description: consumptionForm.usageDescription || null,
        amount: consumptionForm.amount,
      };
      
      if (editingConsumption) {
        const { error } = await supabase.from('opex_consumption').update(data).eq('id', editingConsumption.id);
        if (error) throw error;
        toast.success('Realisasi berhasil diperbarui');
      } else {
        const { error } = await supabase.from('opex_consumption').insert(data);
        if (error) throw error;
        toast.success('Realisasi berhasil ditambahkan');
      }
      
      setIsAddConsumptionOpen(false);
      setEditingConsumption(null);
      resetConsumptionForm();
      fetchData();
    } catch (error) {
      toast.error('Gagal menyimpan realisasi');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDeleteConsumption = async (id: string) => {
    try {
      const { error } = await supabase.from('opex_consumption').delete().eq('id', id);
      if (error) throw error;
      toast.success('Realisasi berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus realisasi');
    }
  };

  const handleEditConsumption = (consumption: OpexConsumption) => {
    setEditingConsumption(consumption);
    setConsumptionForm({
      opexBudgetId: consumption.opexBudgetId || '',
      quarter: consumption.quarter,
      allocationDescription: consumption.allocationDescription,
      usageDescription: consumption.usageDescription || '',
      amount: consumption.amount,
    });
    setIsAddConsumptionOpen(true);
  };

  const resetConsumptionForm = () => {
    setConsumptionForm({
      opexBudgetId: '', quarter: 'Q1', allocationDescription: '', usageDescription: '', amount: 0,
    });
  };

  const getTotal = (budget: OpexBudget) => {
    return MONTHS.reduce((sum, m) => sum + (budget[m as keyof OpexBudget] as number || 0), 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Memuat data finansial...</p>
        </div>
      </div>
    );
  }

  const yearlyStatus = getStatusConfig(rekapAll.yearly.percentage);
  const YearlyIcon = yearlyStatus.icon;

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finansial Tim</h1>
          <p className="text-muted-foreground">Kelola anggaran dan realisasi OPEX</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Tahun:</Label>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert Section */}
      {budgetAlerts.filter(a => a.type === 'critical').length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Perhatian! Budget Melebihi Batas</AlertTitle>
          <AlertDescription>
            {budgetAlerts.filter(a => a.type === 'critical').length} item OPEX telah melebihi budget yang ditetapkan.
          </AlertDescription>
        </Alert>
      )}

      {budgetAlerts.filter(a => a.type === 'warning').length > 0 && budgetAlerts.filter(a => a.type === 'critical').length === 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Peringatan Budget</AlertTitle>
          <AlertDescription>
            {budgetAlerts.filter(a => a.type === 'warning').length} item OPEX mendekati batas budget (≥80%).
          </AlertDescription>
        </Alert>
      )}

      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Total Budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFullCurrency(rekapAll.yearly.budget)}</div>
            <p className="text-xs text-muted-foreground">{opexBudgets.length} item anggaran</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Realisasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFullCurrency(rekapAll.yearly.consumption)}</div>
            <p className="text-xs text-muted-foreground">{opexConsumptions.length} transaksi</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              {rekapAll.yearly.remaining >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Sisa Budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${rekapAll.yearly.remaining < 0 ? 'text-destructive' : 'text-success'}`}>
              {formatFullCurrency(rekapAll.yearly.remaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              {rekapAll.yearly.remaining >= 0 ? 'tersedia' : 'over budget'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Penyerapan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${yearlyStatus.textColor}`}>
                {rekapAll.yearly.percentage}%
              </div>
              <Badge variant={rekapAll.yearly.percentage >= 100 ? 'destructive' : rekapAll.yearly.percentage >= 80 ? 'secondary' : 'default'}>
                <YearlyIcon className="h-3 w-3 mr-1" />
                {yearlyStatus.label}
              </Badge>
            </div>
            <Progress 
              value={Math.min(rekapAll.yearly.percentage, 100)} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Quarterly Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {rekapAll.quarters.map(q => {
          const status = getStatusConfig(q.percentage);
          const StatusIcon = status.icon;
          return (
            <Card key={q.quarter} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${status.color}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{q.quarter}</CardTitle>
                  <Badge variant={q.percentage >= 100 ? 'destructive' : q.percentage >= 80 ? 'secondary' : 'outline'} className="text-xs">
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {q.percentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">{formatFullCurrency(q.budget)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Realisasi</span>
                  <span className="font-medium">{formatFullCurrency(q.consumption)}</span>
                </div>
                <Progress value={Math.min(q.percentage, 100)} className="h-1.5" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa</span>
                  <span className={`font-semibold ${q.remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatFullCurrency(q.remaining)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="budget" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="budget" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Anggaran OPEX</span>
            <span className="sm:hidden">Anggaran</span>
          </TabsTrigger>
          <TabsTrigger value="realisasi" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Realisasi</span>
            <span className="sm:hidden">Realisasi</span>
          </TabsTrigger>
          <TabsTrigger value="detail" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Detail per Item</span>
            <span className="sm:hidden">Detail</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Budget OPEX */}
        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Anggaran OPEX {selectedYear}</CardTitle>
                  <CardDescription>Kelola daftar anggaran biaya operasional per bulan</CardDescription>
                </div>
                <Dialog open={isAddBudgetOpen} onOpenChange={(open) => {
                  setIsAddBudgetOpen(open);
                  if (!open) { setEditingBudget(null); resetBudgetForm(); }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Anggaran
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingBudget ? 'Edit Anggaran OPEX' : 'Tambah Anggaran OPEX'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Deskripsi <span className="text-destructive">*</span></Label>
                          <Input 
                            value={budgetForm.description}
                            onChange={e => setBudgetForm({ ...budgetForm, description: e.target.value })}
                            placeholder="Nama item anggaran"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bidang/Squad</Label>
                          <Select value={budgetForm.squad} onValueChange={(v) => setBudgetForm({ ...budgetForm, squad: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Squad" />
                            </SelectTrigger>
                            <SelectContent>
                              {squads.map(s => (
                                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>OKR</Label>
                          <Input 
                            value={budgetForm.okr}
                            onChange={e => setBudgetForm({ ...budgetForm, okr: e.target.value })}
                            placeholder="OKR-XXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>KPI</Label>
                          <Input 
                            value={budgetForm.kpi}
                            onChange={e => setBudgetForm({ ...budgetForm, kpi: e.target.value })}
                            placeholder="KPI-XXX"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Kode Akun</Label>
                          <Input 
                            value={budgetForm.account}
                            onChange={e => setBudgetForm({ ...budgetForm, account: e.target.value })}
                            placeholder="Nomor akun"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">Budget per Bulan</Label>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {MONTHS.map((month, idx) => (
                            <div key={month} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">{MONTH_LABELS[idx]}</Label>
                              <Input
                                type="number"
                                value={budgetForm[month as keyof typeof budgetForm] || 0}
                                onChange={e => setBudgetForm({ 
                                  ...budgetForm, 
                                  [month]: parseInt(e.target.value) || 0 
                                })}
                                className="text-right"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end pt-2">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <span className="text-sm text-muted-foreground mr-2">Total:</span>
                            <span className="font-bold">
                              {formatFullCurrency(MONTHS.reduce((sum, m) => sum + (budgetForm[m as keyof typeof budgetForm] as number || 0), 0))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                          setIsAddBudgetOpen(false);
                          setEditingBudget(null);
                          resetBudgetForm();
                        }}>
                          Batal
                        </Button>
                        <Button onClick={handleSaveBudget}>
                          {editingBudget ? 'Simpan Perubahan' : 'Tambah Anggaran'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[1200px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-semibold w-12">#</th>
                        <th className="p-3 text-left font-semibold min-w-48">Deskripsi</th>
                        <th className="p-3 text-left font-semibold">Squad</th>
                        <th className="p-3 text-left font-semibold">OKR</th>
                        <th className="p-3 text-left font-semibold">KPI</th>
                        <th className="p-3 text-right font-semibold bg-primary/5">Total</th>
                        {MONTH_LABELS.map(m => (
                          <th key={m} className="p-3 text-right font-semibold min-w-20">{m}</th>
                        ))}
                        <th className="p-3 text-center font-semibold w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opexBudgets.map((budget, idx) => (
                        <tr key={budget.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-muted-foreground">{idx + 1}</td>
                          <td className="p-3 font-medium">{budget.description}</td>
                          <td className="p-3">{budget.squad || '-'}</td>
                          <td className="p-3 text-muted-foreground">{budget.okr || '-'}</td>
                          <td className="p-3 text-muted-foreground">{budget.kpi || '-'}</td>
                          <td className="p-3 text-right font-bold bg-primary/5">{formatFullCurrency(getTotal(budget))}</td>
                          {MONTHS.map(m => (
                            <td key={m} className="p-3 text-right text-muted-foreground">
                              {budget[m as keyof OpexBudget] ? formatFullCurrency(budget[m as keyof OpexBudget] as number) : '-'}
                            </td>
                          ))}
                          <td className="p-3">
                            <div className="flex justify-center gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleEditBudget(budget)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteBudget(budget.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {opexBudgets.length === 0 && (
                        <tr>
                          <td colSpan={18} className="p-8 text-center text-muted-foreground">
                            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada anggaran OPEX untuk tahun {selectedYear}</p>
                            <Button variant="outline" className="mt-3" onClick={() => setIsAddBudgetOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Anggaran Pertama
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Realisasi */}
        <TabsContent value="realisasi" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Realisasi OPEX {selectedYear}</CardTitle>
                  <CardDescription>Catat penggunaan anggaran operasional</CardDescription>
                </div>
                <Dialog open={isAddConsumptionOpen} onOpenChange={(open) => {
                  setIsAddConsumptionOpen(open);
                  if (!open) { setEditingConsumption(null); resetConsumptionForm(); }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Realisasi
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingConsumption ? 'Edit Realisasi' : 'Tambah Realisasi OPEX'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Alokasi Anggaran</Label>
                        <Select 
                          value={consumptionForm.opexBudgetId} 
                          onValueChange={(v) => setConsumptionForm({ ...consumptionForm, opexBudgetId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih item anggaran" />
                          </SelectTrigger>
                          <SelectContent>
                            {opexBudgets.map(b => (
                              <SelectItem key={b.id} value={b.id}>{b.description}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Kuartal</Label>
                        <Select 
                          value={consumptionForm.quarter} 
                          onValueChange={(v) => setConsumptionForm({ ...consumptionForm, quarter: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUARTERS.map(q => (
                              <SelectItem key={q} value={q}>{q}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {consumptionForm.opexBudgetId && (
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Sisa Budget {consumptionForm.quarter}:</span>
                            <span className={`font-bold ${getRemainingBudgetForQuarter(consumptionForm.opexBudgetId, consumptionForm.quarter) < 0 ? 'text-destructive' : 'text-success'}`}>
                              {formatFullCurrency(getRemainingBudgetForQuarter(consumptionForm.opexBudgetId, consumptionForm.quarter))}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Deskripsi Peruntukan <span className="text-destructive">*</span></Label>
                        <Input 
                          value={consumptionForm.allocationDescription}
                          onChange={e => setConsumptionForm({ ...consumptionForm, allocationDescription: e.target.value })}
                          placeholder="e.g. Transport Raker PM SA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Keterangan Tambahan</Label>
                        <Input 
                          value={consumptionForm.usageDescription}
                          onChange={e => setConsumptionForm({ ...consumptionForm, usageDescription: e.target.value })}
                          placeholder="Detail penggunaan (opsional)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jumlah Pemakaian (Rp)</Label>
                        <Input
                          type="number"
                          value={consumptionForm.amount}
                          onChange={e => setConsumptionForm({ ...consumptionForm, amount: parseInt(e.target.value) || 0 })}
                          className="text-right"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                          setIsAddConsumptionOpen(false);
                          setEditingConsumption(null);
                          resetConsumptionForm();
                        }}>
                          Batal
                        </Button>
                        <Button onClick={handleSaveConsumption}>
                          {editingConsumption ? 'Simpan Perubahan' : 'Tambah Realisasi'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-3 text-left font-semibold w-16">Kuartal</th>
                        <th className="p-3 text-left font-semibold min-w-40">Alokasi Anggaran</th>
                        <th className="p-3 text-left font-semibold min-w-48">Peruntukan</th>
                        <th className="p-3 text-left font-semibold">Keterangan</th>
                        <th className="p-3 text-right font-semibold min-w-32">Pemakaian</th>
                        <th className="p-3 text-center font-semibold w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opexConsumptions.map((consumption) => {
                        const budget = opexBudgets.find(b => b.id === consumption.opexBudgetId);
                        return (
                          <tr key={consumption.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <Badge variant="outline">{consumption.quarter}</Badge>
                            </td>
                            <td className="p-3 font-medium">{budget?.description || '-'}</td>
                            <td className="p-3">{consumption.allocationDescription}</td>
                            <td className="p-3 text-muted-foreground">{consumption.usageDescription || '-'}</td>
                            <td className="p-3 text-right font-semibold">{formatFullCurrency(consumption.amount)}</td>
                            <td className="p-3">
                              <div className="flex justify-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEditConsumption(consumption)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteConsumption(consumption.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {opexConsumptions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-muted-foreground">
                            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada realisasi OPEX untuk tahun {selectedYear}</p>
                            <Button variant="outline" className="mt-3" onClick={() => setIsAddConsumptionOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Tambah Realisasi Pertama
                            </Button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Detail per Item */}
        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Penyerapan per Item</CardTitle>
              <CardDescription>Pantau status penyerapan anggaran per item dan kuartal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rekapPerItem.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Belum ada data anggaran untuk ditampilkan</p>
                </div>
              ) : (
                rekapPerItem.map(item => {
                  const status = getStatusConfig(item.totalPercentage);
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={item.budget.id} className="relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-1 h-full ${status.color}`} />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{item.budget.description}</CardTitle>
                            <CardDescription>
                              {item.budget.squad && <span className="mr-3">Squad: {item.budget.squad}</span>}
                              {item.budget.account && <span>Akun: {item.budget.account}</span>}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <Badge variant={item.totalPercentage >= 100 ? 'destructive' : item.totalPercentage >= 80 ? 'secondary' : 'default'}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {item.totalPercentage}% Terpakai
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              Total: {formatFullCurrency(item.totalBudget)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          {item.quarters.map(q => {
                            const qStatus = getStatusConfig(q.percentage);
                            return (
                              <div key={q.quarter} className="p-3 rounded-lg bg-muted/30 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{q.quarter}</span>
                                  <span className={`text-sm font-bold ${qStatus.textColor}`}>{q.percentage}%</span>
                                </div>
                                <Progress value={Math.min(q.percentage, 100)} className="h-1.5" />
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  <div>
                                    <p className="text-muted-foreground">Budget</p>
                                    <p className="font-medium">{formatFullCurrency(q.budget)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Realisasi</p>
                                    <p className="font-medium">{formatFullCurrency(q.consumption)}</p>
                                  </div>
                                </div>
                                <div className="pt-1 border-t">
                                  <p className={`text-xs font-semibold ${q.remaining < 0 ? 'text-destructive' : 'text-success'}`}>
                                    Sisa: {formatFullCurrency(q.remaining)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
