import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
import { ESAT_QUESTIONS, ESAT_CATEGORIES, LIKERT_SCALE } from '@/lib/esatQuestions';
import type { ESATSurvey, ESATResponse, ESATAnswer, ESATCategory } from '@/lib/mockData';
import { ChevronLeft, ChevronRight, Save, Send, CheckCircle2 } from 'lucide-react';

export function ESATSurveyForm() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { esatSurveys, createESATResponse, submitESATResponse, saveESATAnswer } = useData();

    const [survey, setSurvey] = useState<ESATSurvey | null>(null);
    const [currentResponse, setCurrentResponse] = useState<ESATResponse | null>(null);
    const [currentCategory, setCurrentCategory] = useState<ESATCategory>('scope');
    const [answers, setAnswers] = useState<Record<string, { value: number | null; text: string | null }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Respondent info
    const [respondentName, setRespondentName] = useState('');
    const [respondentPosition, setRespondentPosition] = useState('');
    const [respondentSquad, setRespondentSquad] = useState('');
    const [hasStarted, setHasStarted] = useState(false);

    // Load survey and draft from localStorage
    useEffect(() => {
        if (!token) return;

        // Find survey by token (check all statuses first)
        const foundSurvey = esatSurveys.find(s => s.accessToken === token);

        if (!foundSurvey) {
            toast({
                title: 'Survey Not Found',
                description: 'This survey link is invalid or has been closed.',
                variant: 'destructive',
            });
            return;
        }

        // Check if survey is closed
        if (foundSurvey.status === 'closed') {
            setSurvey(foundSurvey); // Set survey to show closed message
            return;
        }

        // Check if survey is not active
        if (foundSurvey.status !== 'active') {
            toast({
                title: 'Survey Not Available',
                description: 'This survey is not currently active.',
                variant: 'destructive',
            });
            return;
        }

        setSurvey(foundSurvey);

        // Load draft from localStorage
        const draftKey = `esat_draft_${token}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setRespondentName(draft.respondentName || '');
                setRespondentPosition(draft.respondentPosition || '');
                setRespondentSquad(draft.respondentSquad || '');
                setAnswers(draft.answers || {});
                setCurrentCategory(draft.currentCategory || 'scope');
                setHasStarted(draft.hasStarted || false);
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    }, [token, esatSurveys]);

    // Save draft to localStorage
    const saveDraft = () => {
        if (!token) return;

        const draftKey = `esat_draft_${token}`;
        const draft = {
            respondentName,
            respondentPosition,
            respondentSquad,
            answers,
            currentCategory,
            hasStarted,
            lastSaved: new Date().toISOString(),
        };

        localStorage.setItem(draftKey, JSON.stringify(draft));
        toast({
            title: 'Draft Saved',
            description: 'Your progress has been saved locally.',
        });
    };

    const handleStart = async () => {
        if (!respondentName.trim()) {
            toast({
                title: 'Name Required',
                description: 'Please enter your name to continue.',
                variant: 'destructive',
            });
            return;
        }

        if (!survey) return;

        try {
            // Create response
            const response = await createESATResponse(
                survey.id,
                respondentName.trim(),
                respondentPosition.trim() || undefined,
                respondentSquad.trim() || undefined
            );

            setCurrentResponse(response);
            setHasStarted(true);
            saveDraft();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to start survey. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleAnswerChange = (questionCode: string, value: number | null, text: string | null = null) => {
        setAnswers(prev => ({
            ...prev,
            [questionCode]: { value, text },
        }));
    };

    const handleSaveAnswer = async (questionCode: string, category: ESATCategory) => {
        if (!currentResponse) return;

        const answer = answers[questionCode];
        if (!answer) return;

        try {
            await saveESATAnswer({
                responseId: currentResponse.id,
                questionCode,
                category,
                answerValue: answer.value,
                answerText: answer.text,
            });
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    };

    const handleNextCategory = () => {
        const categoryKeys = Object.keys(ESAT_CATEGORIES) as ESATCategory[];
        const currentIndex = categoryKeys.indexOf(currentCategory);
        if (currentIndex < categoryKeys.length - 1) {
            setCurrentCategory(categoryKeys[currentIndex + 1]);
            saveDraft();
        }
    };

    const handlePrevCategory = () => {
        const categoryKeys = Object.keys(ESAT_CATEGORIES) as ESATCategory[];
        const currentIndex = categoryKeys.indexOf(currentCategory);
        if (currentIndex > 0) {
            setCurrentCategory(categoryKeys[currentIndex - 1]);
            saveDraft();
        }
    };

    const handleSubmit = async () => {
        if (!currentResponse) return;

        // Check if all required questions are answered
        const requiredQuestions = ESAT_QUESTIONS.filter(q => q.type === 'likert');
        const unanswered = requiredQuestions.filter(q => !answers[q.code]?.value);

        if (unanswered.length > 0) {
            toast({
                title: 'Incomplete Survey',
                description: `Please answer all ${unanswered.length} remaining question(s).`,
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Save all answers
            for (const question of ESAT_QUESTIONS) {
                const answer = answers[question.code];
                if (answer) {
                    await handleSaveAnswer(question.code, question.category);
                }
            }

            // Submit response
            await submitESATResponse(currentResponse.id);

            // Clear draft
            if (token) {
                localStorage.removeItem(`esat_draft_${token}`);
            }

            // Navigate to thank you page
            navigate(`/survey/${token}/thank-you`);
        } catch (error) {
            toast({
                title: 'Submission Failed',
                description: 'Failed to submit survey. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentQuestions = ESAT_QUESTIONS.filter(q => q.category === currentCategory);
    const totalQuestions = ESAT_QUESTIONS.length;
    const answeredCount = Object.keys(answers).filter(k => answers[k]?.value || answers[k]?.text).length;
    const progress = (answeredCount / totalQuestions) * 100;

    const categoryKeys = Object.keys(ESAT_CATEGORIES) as ESATCategory[];
    const currentCategoryIndex = categoryKeys.indexOf(currentCategory);
    const isFirstCategory = currentCategoryIndex === 0;
    const isLastCategory = currentCategoryIndex === categoryKeys.length - 1;

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="p-8 max-w-md w-full text-center">
                    <p className="text-muted-foreground">Loading survey...</p>
                </Card>
            </div>
        );
    }

    // Show closed message if survey is closed
    if (survey.status === 'closed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Survey Sudah Ditutup</h1>
                        <p className="text-muted-foreground">
                            Maaf, survey <strong>{survey.title}</strong> sudah tidak menerima respons lagi.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Survey ini ditutup dan tidak lagi menerima pengisian baru.
                            Terima kasih atas perhatian Anda.
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    if (!hasStarted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
                        <p className="text-muted-foreground">
                            Evaluasi Kepuasan Pegawai - {survey.period}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                value={respondentName}
                                onChange={(e) => setRespondentName(e.target.value)}
                                placeholder="Masukkan nama lengkap Anda"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position">Posisi/Role (opsional)</Label>
                            <Input
                                id="position"
                                value={respondentPosition}
                                onChange={(e) => setRespondentPosition(e.target.value)}
                                placeholder="e.g., Backend Developer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="squad">Squad/Tim (opsional)</Label>
                            <Input
                                id="squad"
                                value={respondentSquad}
                                onChange={(e) => setRespondentSquad(e.target.value)}
                                placeholder="e.g., Alpha Squad"
                            />
                        </div>

                        <Button onClick={handleStart} className="w-full mt-6">
                            Mulai Survey →
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">{survey.title} - {respondentName}</h1>
                            <p className="text-sm text-muted-foreground">{survey.period}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={saveDraft}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{answeredCount}/{totalQuestions} questions</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </Card>

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categoryKeys.map((cat) => {
                        const categoryInfo = ESAT_CATEGORIES[cat];
                        const Icon = categoryInfo.icon;
                        const isActive = cat === currentCategory;
                        const categoryQuestions = ESAT_QUESTIONS.filter(q => q.category === cat);
                        const categoryAnswered = categoryQuestions.filter(q => answers[q.code]?.value || answers[q.code]?.text).length;
                        const isComplete = categoryAnswered === categoryQuestions.length;

                        return (
                            <button
                                key={cat}
                                onClick={() => setCurrentCategory(cat)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${isActive
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : isComplete
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm font-medium">{categoryInfo.label}</span>
                                {isComplete && <CheckCircle2 className="h-4 w-4" />}
                            </button>
                        );
                    })}
                </div>

                {/* Questions */}
                <Card className="p-6 mb-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            {React.createElement(ESAT_CATEGORIES[currentCategory].icon, { className: 'h-5 w-5' })}
                            {ESAT_CATEGORIES[currentCategory].label}
                        </h2>
                    </div>

                    <div className="space-y-8">
                        {currentQuestions.map((question, index) => (
                            <div key={question.code} className="space-y-3">
                                <Label className="text-base font-medium">
                                    {index + 1}. {question.text}
                                </Label>

                                {question.type === 'likert' ? (
                                    <RadioGroup
                                        value={answers[question.code]?.value?.toString() || ''}
                                        onValueChange={(value) => {
                                            handleAnswerChange(question.code, parseInt(value), null);
                                            handleSaveAnswer(question.code, question.category);
                                        }}
                                    >
                                        <div className="space-y-2">
                                            {LIKERT_SCALE.map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option.value.toString()} id={`${question.code}-${option.value}`} />
                                                    <Label
                                                        htmlFor={`${question.code}-${option.value}`}
                                                        className="font-normal cursor-pointer flex-1"
                                                    >
                                                        {option.value} - {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <Textarea
                                        value={answers[question.code]?.text || ''}
                                        onChange={(e) => handleAnswerChange(question.code, null, e.target.value)}
                                        onBlur={() => handleSaveAnswer(question.code, question.category)}
                                        placeholder="Tuliskan jawaban Anda di sini..."
                                        rows={4}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handlePrevCategory}
                        disabled={isFirstCategory}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    {isLastCategory ? (
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                            <Send className="h-4 w-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                        </Button>
                    ) : (
                        <Button onClick={handleNextCategory}>
                            Next: {ESAT_CATEGORIES[categoryKeys[currentCategoryIndex + 1]].label}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
