import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import type { ESATSurvey, ESATResponse, ESATAnswer, ESATCategory } from '@/lib/mockData';
import {
    getAllCategoryAverages,
    getCompletionRate,
    getResponsesWithAnswers,
    getResponseCompletionPercentage,
    getScoreBgColor
} from '@/lib/esatAnalytics';
import { ESAT_CATEGORIES, ESAT_QUESTIONS } from '@/lib/esatQuestions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, CheckCircle2, TrendingUp, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';

interface ESATSurveyResultsProps {
    survey: ESATSurvey;
}

export function ESATSurveyResults({ survey }: ESATSurveyResultsProps) {
    const { esatResponses, esatAnswers, getESATResponsesForSurvey, getESATAnswersForResponse } = useData();
    const [selectedResponse, setSelectedResponse] = useState<ESATResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Get responses for this survey
    const surveyResponses = useMemo(() => {
        return getESATResponsesForSurvey(survey.id);
    }, [survey.id, esatResponses]);

    // Get all answers for this survey
    const surveyAnswers = useMemo(() => {
        const responseIds = surveyResponses.map(r => r.id);
        return esatAnswers.filter(a => responseIds.includes(a.responseId));
    }, [surveyResponses, esatAnswers]);

    // Calculate statistics
    const stats = useMemo(() => {
        const completionRate = getCompletionRate(surveyResponses);
        const categoryAverages = getAllCategoryAverages(surveyAnswers);

        return {
            totalResponses: surveyResponses.length,
            completedResponses: surveyResponses.filter(r => r.isComplete).length,
            completionRate,
            categoryAverages,
        };
    }, [surveyResponses, surveyAnswers]);

    // Prepare chart data
    const chartData = useMemo(() => {
        const categories: ESATCategory[] = ['scope', 'workload', 'collaboration', 'process', 'pm_direction'];
        return categories.map(cat => ({
            category: ESAT_CATEGORIES[cat].label,
            score: stats.categoryAverages[cat],
            fullMark: 5,
        }));
    }, [stats.categoryAverages]);

    // Filter responses based on search
    const filteredResponses = useMemo(() => {
        if (!searchQuery.trim()) return surveyResponses;

        const query = searchQuery.toLowerCase();
        return surveyResponses.filter(r =>
            r.respondentName.toLowerCase().includes(query) ||
            r.respondentPosition?.toLowerCase().includes(query) ||
            r.respondentSquad?.toLowerCase().includes(query)
        );
    }, [surveyResponses, searchQuery]);

    // Get answers for selected response
    const selectedResponseAnswers = useMemo(() => {
        if (!selectedResponse) return [];
        return getESATAnswersForResponse(selectedResponse.id);
    }, [selectedResponse, esatAnswers]);

    // Group selected response answers by category
    const groupedAnswers = useMemo(() => {
        const grouped: Record<string, ESATAnswer[]> = {
            scope: [],
            workload: [],
            collaboration: [],
            process: [],
            pm_direction: [],
            open_ended: [],
        };

        selectedResponseAnswers.forEach(answer => {
            if (grouped[answer.category]) {
                grouped[answer.category].push(answer);
            }
        });

        return grouped;
    }, [selectedResponseAnswers]);

    const getBarColor = (score: number) => {
        if (score >= 4.5) return '#22c55e'; // green
        if (score >= 3.5) return '#3b82f6'; // blue
        if (score >= 2.5) return '#6b7280'; // gray
        if (score >= 1.5) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    if (surveyResponses.length === 0) {
        return (
            <Card className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Responses Yet</h3>
                <p className="text-muted-foreground">
                    This survey hasn't received any responses yet. Share the survey link to start collecting feedback.
                </p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Responses</p>
                            <p className="text-2xl font-bold">{stats.totalResponses}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold">{stats.completedResponses}</p>
                            <p className="text-xs text-muted-foreground">{stats.completionRate}% completion rate</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Score</p>
                            <p className="text-2xl font-bold">
                                {(Object.values(stats.categoryAverages).filter((_, i) => i < 5).reduce((a, b) => a + b, 0) / 5).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">out of 5.00</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Category Scores Chart */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Average Scores by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                        <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                        <Tooltip />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* Responses Table */}
            <Card>
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Individual Responses</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, position, or squad..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Respondent</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Squad</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredResponses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No responses found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResponses.map((response) => {
                                const responseAnswers = getESATAnswersForResponse(response.id);
                                const completionPct = getResponseCompletionPercentage(responseAnswers);

                                return (
                                    <TableRow key={response.id}>
                                        <TableCell className="font-medium">{response.respondentName}</TableCell>
                                        <TableCell>{response.respondentPosition || '-'}</TableCell>
                                        <TableCell>{response.respondentSquad || '-'}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {response.submittedAt
                                                ? format(new Date(response.submittedAt), 'dd MMM yyyy, HH:mm')
                                                : 'In progress'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {response.isComplete ? (
                                                <Badge className="bg-green-500">Complete</Badge>
                                            ) : (
                                                <Badge variant="outline">{completionPct}% Complete</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedResponse(response)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Response Detail Dialog */}
            <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Response Details</DialogTitle>
                    </DialogHeader>

                    {selectedResponse && (
                        <div className="space-y-6">
                            {/* Respondent Info */}
                            <Card className="p-4 bg-muted/50">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="font-medium">{selectedResponse.respondentName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Position</p>
                                        <p className="font-medium">{selectedResponse.respondentPosition || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Squad</p>
                                        <p className="font-medium">{selectedResponse.respondentSquad || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Submitted</p>
                                        <p className="font-medium">
                                            {selectedResponse.submittedAt
                                                ? format(new Date(selectedResponse.submittedAt), 'dd MMM yyyy')
                                                : 'In progress'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Answers by Category */}
                            {(['scope', 'workload', 'collaboration', 'process', 'pm_direction', 'open_ended'] as ESATCategory[]).map((category) => {
                                const categoryAnswers = groupedAnswers[category] || [];
                                const categoryQuestions = ESAT_QUESTIONS.filter(q => q.category === category);

                                if (categoryQuestions.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-3">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {React.createElement(ESAT_CATEGORIES[category].icon, { className: 'h-5 w-5' })}
                                            {ESAT_CATEGORIES[category].label}
                                        </h4>

                                        <div className="space-y-4">
                                            {categoryQuestions.map((question) => {
                                                const answer = categoryAnswers.find(a => a.questionCode === question.code);

                                                return (
                                                    <div key={question.code} className="border-l-2 border-muted pl-4">
                                                        <p className="text-sm font-medium mb-2">{question.text}</p>
                                                        {question.type === 'likert' ? (
                                                            answer?.answerValue ? (
                                                                <Badge className={getScoreBgColor(answer.answerValue)}>
                                                                    Score: {answer.answerValue}/5
                                                                </Badge>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground italic">Not answered</p>
                                                            )
                                                        ) : (
                                                            answer?.answerText ? (
                                                                <p className="text-sm bg-muted p-3 rounded-md">{answer.answerText}</p>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground italic">Not answered</p>
                                                            )
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
