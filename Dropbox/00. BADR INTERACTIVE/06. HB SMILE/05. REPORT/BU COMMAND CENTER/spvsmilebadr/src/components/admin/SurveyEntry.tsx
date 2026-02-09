import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

export function SurveyEntry() {
  const { addSurveyData } = useData();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [csat, setCsat] = useState([80]);
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
        csat: csat[0],
        esat: esat[0],
      });

      toast({ title: 'Berhasil', description: 'Data survey berhasil ditambahkan' });
      setDate('');
      setCsat([80]);
      setEsat([80]);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data survey', variant: 'destructive' });
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
        <h3 className="text-lg font-semibold">Survey Entry</h3>
        <p className="text-sm text-muted-foreground">Catat skor CSAT dan ESAT</p>
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
            <Label>CSAT Score (Customer Satisfaction)</Label>
            <span className={`text-xl font-bold ${getScoreColor(csat[0])}`}>{csat[0]}%</span>
          </div>
          <Slider
            value={csat}
            onValueChange={setCsat}
            max={100}
            step={1}
            className="w-full"
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
          {isLoading ? 'Menyimpan...' : 'Tambah Data Survey'}
        </Button>
      </form>
    </Card>
  );
}
