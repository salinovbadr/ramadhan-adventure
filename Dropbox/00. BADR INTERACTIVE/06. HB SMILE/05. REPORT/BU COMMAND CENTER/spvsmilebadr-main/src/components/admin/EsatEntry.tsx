import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Smile } from 'lucide-react';

export function EsatEntry() {
  const { addSurveyData } = useData();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [esat, setEsat] = useState([80]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({ title: 'Error', description: 'Mohon pilih tanggal', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      await addSurveyData({
        date,
        csat: 0, // CSAT now handled separately
        esat: esat[0],
      });

      toast({ title: 'Berhasil', description: 'Data ESAT berhasil ditambahkan' });
      setDate('');
      setEsat([80]);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data ESAT', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <Smile className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">ESAT Entry (Overall)</h3>
            <p className="text-sm text-muted-foreground">Catat skor ESAT keseluruhan tim</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <Label>Tanggal Survey</Label>
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>ESAT Score (Employee Satisfaction)</Label>
            <span className={`text-xl font-bold ${getScoreColor(esat[0])}`}>{esat[0]}%</span>
          </div>
          <Slider
            value={esat}
            onValueChange={setEsat}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          {isLoading ? 'Menyimpan...' : 'Tambah Data ESAT'}
        </Button>
      </form>
    </Card>
  );
}
