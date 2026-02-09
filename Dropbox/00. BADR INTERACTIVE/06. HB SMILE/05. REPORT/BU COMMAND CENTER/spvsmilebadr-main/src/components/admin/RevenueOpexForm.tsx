import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyInput, parseFormattedNumber } from '@/components/ui/currency-input';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = [2023, 2024, 2025, 2026];

export function RevenueOpexForm() {
  const { addMonthlyData } = useData();
  const { toast } = useToast();
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [revenue, setRevenue] = useState('');
  const [opex, setOpex] = useState('');
  const [cogs, setCogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!month || !year || !revenue || !opex || !cogs) {
      toast({ title: 'Error', description: 'Mohon isi semua field', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await addMonthlyData({
        month,
        year: parseInt(year),
        revenue: parseFormattedNumber(revenue),
        opex: parseFormattedNumber(opex),
        cogs: parseFormattedNumber(cogs),
      });

      toast({ title: 'Berhasil', description: 'Data bulanan berhasil ditambahkan' });
      setMonth('');
      setYear('');
      setRevenue('');
      setOpex('');
      setCogs('');
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">Revenue & OPEX Entry</h3>
        <p className="text-sm text-muted-foreground">Tambahkan data finansial bulanan</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Bulan</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tahun</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Revenue</Label>
          <CurrencyInput 
            placeholder="5.000.000.000" 
            value={revenue} 
            onChange={setRevenue} 
          />
        </div>
        <div className="space-y-2">
          <Label>OPEX</Label>
          <CurrencyInput 
            placeholder="2.000.000.000" 
            value={opex} 
            onChange={setOpex} 
          />
        </div>
        <div className="space-y-2">
          <Label>COGS</Label>
          <CurrencyInput 
            placeholder="2.500.000.000" 
            value={cogs} 
            onChange={setCogs} 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? 'Menyimpan...' : 'Tambah Data Bulanan'}
        </Button>
      </form>
    </Card>
  );
}
