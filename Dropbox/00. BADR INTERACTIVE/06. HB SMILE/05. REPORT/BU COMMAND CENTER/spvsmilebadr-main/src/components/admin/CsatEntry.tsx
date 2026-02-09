import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Star, MessageSquare, Copy, Check, ExternalLink, Calendar as CalendarIcon, History, Trash2, X } from 'lucide-react';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { useCsat } from '@/hooks/useCsat';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CsatEntry() {
  const { projects } = useData();
  const { toast } = useToast();
  const { surveys, isLoading, createBulkSurveys } = useCsat();

  // Filters
  const [filterProject, setFilterProject] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });

  // Bulk Create State
  const [isOpen, setIsOpen] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [reviewers, setReviewers] = useState<{ name: string; role: string }[]>([
    { name: '', role: '' }
  ]);
  const [creating, setCreating] = useState(false);

  // UI State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSurveyHistory, setSelectedSurveyHistory] = useState<any>(null);

  // -- Filters Handling --
  const filteredSurveys = surveys?.filter(survey => {
    const matchesProject = filterProject === "all" || survey.project_id === filterProject;

    let matchesDate = true;
    if (dateRange.from && dateRange.to) {
      const surveyDate = new Date(survey.created_at);
      matchesDate = isWithinInterval(surveyDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to)
      });
    }

    return matchesProject && matchesDate;
  }) || [];

  // -- Bulk Create Handling --
  const addReviewerRow = () => {
    setReviewers([...reviewers, { name: '', role: '' }]);
  };

  const removeReviewerRow = (index: number) => {
    if (reviewers.length > 1) {
      const newReviewers = [...reviewers];
      newReviewers.splice(index, 1);
      setReviewers(newReviewers);
    }
  };

  const updateReviewer = (index: number, field: 'name' | 'role', value: string) => {
    const newReviewers = [...reviewers];
    newReviewers[index][field] = value;
    setReviewers(newReviewers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const validReviewers = reviewers.filter(r => r.name.trim() !== '');
      if (validReviewers.length === 0) throw new Error("Minimal satu reviewer harus diisi");

      await createBulkSurveys.mutateAsync(validReviewers.map(r => ({
        reviewer_name: r.name,
        reviewer_role: r.role || null,
        project_id: projectId || null,
        status: 'pending'
      })));

      toast({ title: 'Berhasil', description: `${validReviewers.length} Survey link berhasil dibuat` });
      setIsOpen(false);
      setProjectId('');
      setReviewers([{ name: '', role: '' }]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // -- Helpers --
  const copyLink = (token: string) => {
    const link = `${window.location.origin}/feedback/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    toast({ description: 'Link survey disalin ke clipboard' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score === 5) return 'text-success';
    if (score === 4) return 'text-success/80';
    if (score === 3) return 'text-yellow-500';
    return 'text-destructive';
  };

  // Calculate average from surveys that have responses (regardless of status)
  const completedSurveys = filteredSurveys.filter(s => s.latest_response);
  const avgCsat = completedSurveys.length > 0
    ? (completedSurveys.reduce((sum, s) => sum + (s.latest_response?.csat_score || 0), 0) / completedSurveys.length).toFixed(1)
    : '0';

  return (
    <Card className="card-shadow">
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">CSAT Surveys</h3>
              <p className="text-sm text-muted-foreground">Kelola survey kepuasan pelanggan</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Buat Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Buat Link Survey Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Proyek (Opsional)</Label>
                  <Select
                    value={projectId || "none"}
                    onValueChange={(v) => setProjectId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih proyek (Satu project untuk semua reviewer)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Umum / Tidak ada</SelectItem>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Daftar Reviewer</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addReviewerRow}>
                      <Plus className="h-3 w-3 mr-1" /> Tambah Baris
                    </Button>
                  </div>
                  <div className="border rounded-md p-2 space-y-2 max-h-[300px] overflow-y-auto">
                    {reviewers.map((reviewer, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <Input
                          placeholder="Nama Reviewer *"
                          value={reviewer.name}
                          onChange={(e) => updateReviewer(idx, 'name', e.target.value)}
                          required
                          className="flex-1"
                        />
                        <Input
                          placeholder="Role (e.g. PM)"
                          value={reviewer.role}
                          onChange={(e) => updateReviewer(idx, 'role', e.target.value)}
                          className="flex-1"
                        />
                        {reviewers.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeReviewerRow(idx)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? 'Membuat Link...' : `Generate ${reviewers.filter(r => r.name).length} Link Survey`}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-muted/20 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter Project:</span>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[200px] h-8">
                <SelectValue placeholder="Semua Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Project</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter Tanggal:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 justify-start text-left font-normal w-[240px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pilih Rentang Tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range: any) => setDateRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(dateRange.from || dateRange.to) && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDateRange({ from: undefined, to: undefined })}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Rata-rata Score (Filtered):</span>
          <div className="flex items-end gap-1">
            <span className={`text-2xl font-bold ${getScoreColor(Math.round(parseFloat(avgCsat)))}`}>{avgCsat}</span>
            <span className="text-muted-foreground text-sm mb-1">/ 5</span>
          </div>
          <span className="text-sm text-muted-foreground">dari {completedSurveys.length} survey selesai</span>
        </div>
      </div>

      <div className="p-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dibuat Tanggal</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Proyek</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Feedback (Terbaru)</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredSurveys.map((survey) => (
                <TableRow key={survey.id}>
                  <TableCell>{format(new Date(survey.created_at), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <div className="font-medium">{survey.reviewer_name}</div>
                    <div className="text-xs text-muted-foreground">{survey.reviewer_role}</div>
                  </TableCell>
                  <TableCell>{survey.project?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={(survey.status === 'completed' || survey.latest_response) ? 'default' : 'secondary'}
                      className={(survey.status === 'completed' || survey.latest_response) ? 'bg-green-600' : ''}
                    >
                      {(survey.status === 'completed' || survey.latest_response) ? 'Selesai' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {survey.latest_response ? (
                      <span className={`font-bold ${getScoreColor(survey.latest_response.csat_score)}`}>
                        {survey.latest_response.csat_score} / 5
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    {survey.latest_response?.feedback ? (
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1 text-muted-foreground cursor-help truncate flex-1">
                                <MessageSquare className="h-3 w-3 shrink-0" />
                                <span className="truncate">{survey.latest_response.feedback}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px]">
                              <p>{survey.latest_response.feedback}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {/* History Trigger */}
                        {survey.responses && survey.responses.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => setSelectedSurveyHistory(survey)}
                            title="Lihat history isian"
                          >
                            <History className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => copyLink(survey.public_token)}>
                        {copiedId === survey.public_token ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={`/feedback/${survey.public_token}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!filteredSurveys || filteredSurveys.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Tidak ada data survey yang sesuai filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* History Modal */}
      <Dialog open={!!selectedSurveyHistory} onOpenChange={(open) => !open && setSelectedSurveyHistory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Riwayat Masukan: {selectedSurveyHistory?.reviewer_name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {selectedSurveyHistory?.responses?.map((res: any, idx: number) => (
                <div key={res.id} className="border rounded-lg p-4 bg-muted/10">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(res.submitted_at), 'dd MMM yyyy HH:mm')}
                    </div>
                    {idx === 0 && <Badge variant="outline" className="text-xs">Terbaru</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">Score:</span>
                    <span className={`font-bold ${getScoreColor(res.csat_score)}`}>{res.csat_score}/5</span>
                  </div>
                  <div className="bg-white p-3 rounded border text-sm">
                    {res.feedback || <span className="text-muted-foreground italic">Tidak ada feedback text</span>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
