import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface CsvImportProps {
  title: string;
  description: string;
  templateColumns: { key: string; label: string; required?: boolean }[];
  onImport: (data: Record<string, string>[]) => Promise<void>;
  templateFileName: string;
}

export function CsvImport({ title, description, templateColumns, onImport, templateFileName }: CsvImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setParsedData([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'csv') {
      setErrors(['File harus berformat CSV']);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const validData: Record<string, string>[] = [];

        // Check for required columns
        const headers = results.meta.fields || [];
        const requiredColumns = templateColumns.filter(c => c.required).map(c => c.key);
        const missingColumns = requiredColumns.filter(c => !headers.includes(c));
        
        if (missingColumns.length > 0) {
          validationErrors.push(`Kolom wajib tidak ditemukan: ${missingColumns.join(', ')}`);
        }

        // Validate each row
        if (missingColumns.length === 0) {
          results.data.forEach((row: any, index: number) => {
            const rowErrors: string[] = [];
            
            requiredColumns.forEach(col => {
              if (!row[col] || row[col].trim() === '') {
                rowErrors.push(`Kolom "${col}" kosong`);
              }
            });

            if (rowErrors.length > 0) {
              validationErrors.push(`Baris ${index + 2}: ${rowErrors.join(', ')}`);
            } else {
              validData.push(row);
            }
          });
        }

        setErrors(validationErrors);
        setParsedData(validData);
      },
      error: (error) => {
        setErrors([`Error parsing CSV: ${error.message}`]);
      }
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(parsedData);
      toast({ title: 'Berhasil', description: `${parsedData.length} data berhasil diimport` });
      setIsOpen(false);
      resetState();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Gagal mengimport data', variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = templateColumns.map(c => c.key).join(',');
    const exampleRow = templateColumns.map(c => c.label).join(',');
    const csvContent = `${headers}\n${exampleRow}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = templateFileName;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <p className="text-sm text-muted-foreground">{description}</p>

          {/* Template Download */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>

          {/* Required Columns */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Kolom wajib:</span>
            {templateColumns.filter(c => c.required).map(c => (
              <Badge key={c.key} variant="secondary">{c.key}</Badge>
            ))}
          </div>

          {/* File Input */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Pilih File CSV
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Atau drag & drop file CSV di sini
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.slice(0, 5).map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-sm">...dan {errors.length - 5} error lainnya</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Data */}
          {parsedData.length > 0 && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{parsedData.length} data valid siap diimport</span>
              </div>
              <ScrollArea className="flex-1 border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      {templateColumns.map(c => (
                        <TableHead key={c.key}>{c.label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        {templateColumns.map(c => (
                          <TableCell key={c.key}>{row[c.key] || '-'}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {parsedData.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={templateColumns.length + 1} className="text-center text-muted-foreground">
                          ...dan {parsedData.length - 10} data lainnya
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Import Button */}
          {parsedData.length > 0 && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setIsOpen(false); resetState(); }}>
                Batal
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Mengimport...' : `Import ${parsedData.length} Data`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
