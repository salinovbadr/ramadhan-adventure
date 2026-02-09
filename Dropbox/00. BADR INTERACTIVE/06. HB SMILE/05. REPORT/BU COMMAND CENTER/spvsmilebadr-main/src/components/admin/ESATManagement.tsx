import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import type { ESATSurvey } from '@/lib/mockData';
import { Plus, Calendar, Link2, BarChart3, FileDown, Eye, Pencil, Trash2, Copy, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ESATSurveyResults } from './ESATSurveyResults';

const initialFormData = {
    title: '',
    period: '',
    startDate: '',
    endDate: '',
};

export function ESATManagement() {
    const { esatSurveys, addESATSurvey, updateESATSurvey, deleteESATSurvey } = useData();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [editingSurvey, setEditingSurvey] = useState<ESATSurvey | null>(null);
    const [formData, setFormData] = useState(initialFormData);
    const [selectedSurvey, setSelectedSurvey] = useState<ESATSurvey | null>(null);
    const [surveyToClose, setSurveyToClose] = useState<ESATSurvey | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingSurvey) {
                await updateESATSurvey(editingSurvey.id, {
                    title: formData.title,
                    period: formData.period,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: editingSurvey.status,
                });
                toast({
                    title: 'Survey Updated',
                    description: 'ESAT survey has been updated successfully.',
                });
            } else {
                await addESATSurvey({
                    title: formData.title,
                    period: formData.period,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    status: 'draft',
                    accessToken: null,
                });
                toast({
                    title: 'Survey Created',
                    description: 'New ESAT survey has been created successfully.',
                });
            }
            setIsOpen(false);
            resetForm();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save survey. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (survey: ESATSurvey) => {
        setEditingSurvey(survey);
        setFormData({
            title: survey.title,
            period: survey.period,
            startDate: survey.startDate,
            endDate: survey.endDate,
        });
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this survey?')) {
            try {
                await deleteESATSurvey(id);
                toast({
                    title: 'Survey Deleted',
                    description: 'ESAT survey has been deleted successfully.',
                });
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete survey. Please try again.',
                    variant: 'destructive',
                });
            }
        }
    };

    const handleCopyLink = (survey: ESATSurvey) => {
        if (!survey.accessToken) {
            toast({
                title: 'No Link Available',
                description: 'Survey link will be generated when the survey is activated.',
                variant: 'destructive',
            });
            return;
        }

        const link = `${window.location.origin}/survey/${survey.accessToken}`;
        navigator.clipboard.writeText(link);
        toast({
            title: 'Link Copied!',
            description: 'Survey link has been copied to clipboard.',
        });
    };

    const handleActivate = async (survey: ESATSurvey) => {
        try {
            await updateESATSurvey(survey.id, {
                ...survey,
                status: 'active',
            });
            toast({
                title: 'Survey Activated',
                description: 'Survey is now active and accessible via public link.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to activate survey.',
                variant: 'destructive',
            });
        }
    };

    const handleClose = async () => {
        if (!surveyToClose) return;

        try {
            await updateESATSurvey(surveyToClose.id, {
                ...surveyToClose,
                status: 'closed',
            });
            toast({
                title: 'Survey Closed',
                description: 'Survey has been closed and is no longer accepting responses.',
            });
            setSurveyToClose(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to close survey.',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setEditingSurvey(null);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="outline" className="bg-gray-50">Draft</Badge>;
            case 'active':
                return <Badge className="bg-green-500">Active</Badge>;
            case 'closed':
                return <Badge variant="secondary">Closed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const sortedSurveys = useMemo(() => {
        return [...esatSurveys].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [esatSurveys]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">ESAT Survey Management</h2>
                    <p className="text-muted-foreground">
                        Create and manage Employee Satisfaction surveys
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Survey
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSurvey ? 'Edit Survey' : 'Create New Survey'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Survey Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., ESAT Survey H1 2026"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="period">Period</Label>
                                <Input
                                    id="period"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    placeholder="e.g., H1 2026"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingSurvey ? 'Update' : 'Create'} Survey
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Surveys Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Public Link</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSurveys.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No surveys yet. Create your first ESAT survey to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedSurveys.map((survey) => (
                                <TableRow key={survey.id}>
                                    <TableCell className="font-medium">{survey.title}</TableCell>
                                    <TableCell>{survey.period}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(survey.startDate), 'dd MMM')} - {format(new Date(survey.endDate), 'dd MMM yyyy')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(survey.status)}</TableCell>
                                    <TableCell>
                                        {survey.status === 'active' && survey.accessToken ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCopyLink(survey)}
                                                className="h-8 gap-2"
                                            >
                                                <Link2 className="h-3 w-3" />
                                                Copy Link
                                            </Button>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {survey.status === 'draft' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleActivate(survey)}
                                                    className="h-8"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                                    Activate
                                                </Button>
                                            )}
                                            {survey.status === 'active' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSurveyToClose(survey)}
                                                    className="h-8"
                                                >
                                                    Close
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedSurvey(survey)}
                                                className="h-8"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            {survey.status === 'draft' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(survey)}
                                                        className="h-8"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(survey.id)}
                                                        className="h-8 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Survey Detail View */}
            {selectedSurvey && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold">{selectedSurvey.title}</h3>
                        <Button variant="outline" onClick={() => setSelectedSurvey(null)}>
                            Close
                        </Button>
                    </div>
                    <ESATSurveyResults survey={selectedSurvey} />
                </Card>
            )}

            {/* Close Survey Confirmation Dialog */}
            <AlertDialog open={!!surveyToClose} onOpenChange={() => setSurveyToClose(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Close Survey?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to close this survey? Once closed, users will no longer be able to submit responses.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClose} className="bg-destructive hover:bg-destructive/90">
                            Close Survey
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
