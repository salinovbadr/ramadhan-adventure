import { useState } from 'react';
import { Plus, Trash2, GripVertical, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  order_index: number;
}

interface FAQEditorProps {
  faqs: FAQItem[];
  onFaqsChange: (faqs: FAQItem[]) => void;
}

export function FAQEditor({ faqs, onFaqsChange }: FAQEditorProps) {
  const addFaq = () => {
    onFaqsChange([
      ...faqs,
      { question: '', answer: '', order_index: faqs.length },
    ]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onFaqsChange(newFaqs);
  };

  const removeFaq = (index: number) => {
    const newFaqs = faqs.filter((_, i) => i !== index).map((faq, i) => ({
      ...faq,
      order_index: i,
    }));
    onFaqsChange(newFaqs);
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === faqs.length - 1)
    ) {
      return;
    }

    const newFaqs = [...faqs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFaqs[index], newFaqs[swapIndex]] = [newFaqs[swapIndex], newFaqs[index]];
    
    // Update order indices
    newFaqs.forEach((faq, i) => {
      faq.order_index = i;
    });
    
    onFaqsChange(newFaqs);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          FAQ (Frequently Asked Questions)
        </Label>
        <Button type="button" variant="outline" size="sm" onClick={addFaq}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Belum ada FAQ. Klik tombol di atas untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 pt-2">
                    <button
                      type="button"
                      onClick={() => moveFaq(index, 'up')}
                      className={cn(
                        'p-1 hover:bg-muted rounded text-muted-foreground',
                        index === 0 && 'opacity-30 cursor-not-allowed'
                      )}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Pertanyaan #{index + 1}
                      </Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                        placeholder="Masukkan pertanyaan..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Jawaban</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        placeholder="Masukkan jawaban..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeFaq(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
