import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Star, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Survey = Database['public']['Tables']['csat_surveys']['Row'] & {
    project: { name: string } | null;
};

export default function FeedbackPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [survey, setSurvey] = useState<Survey | null>(null);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        fetchSurvey();
    }, [token]);

    const fetchSurvey = async () => {
        try {
            const { data, error } = await supabase
                .from('csat_surveys')
                .select('*, project:projects(name)')
                .eq('public_token', token)
                .single();

            if (error) throw error;
            if (data.status === 'completed') {
                setSubmitted(true);
            }
            setSurvey(data as Survey);
        } catch (error) {
            console.error('Error fetching survey:', error);
            toast({ title: 'Error', description: 'Survey tidak ditemukan atau sudah kadaluarsa', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!survey || rating === 0) return;
        setSubmitting(true);

        try {
            // 1. Insert response
            const { error: responseError } = await supabase
                .from('csat_responses')
                .insert({
                    survey_id: survey.id,
                    csat_score: rating,
                    feedback: feedback || null,
                });

            if (responseError) throw responseError;

            // 2. Update survey status using RPC or direct update if policy allows (we set policy to allow update? No, we didn't).
            // Actually, our RLS policy says Public can INSERT to responses.
            // But update status on survey? 
            // We need to trigger status update. Since public cannot update 'csat_surveys' directly (RLS: Read Only),
            // we might need a database trigger or an Edge Function.
            // For now, let's try to update and see if it fails. If it fails, I'll need to add an RLS or function.
            // WAIT: My earlier plan said "System saves data". 
            // Trigger approach: "AFTER INSERT ON csat_responses -> UPDATE csat_surveys SET status='completed'"
            // I forgot to add that trigger in the migration.
            // I will handle it by ignoring the survey status update on client side for now, 
            // OR I should call a function. 
            // Let's rely on the Trigger I will create sequentially after this file.

            setSubmitted(true);
            toast({ title: 'Terima Kasih', description: 'Masukan Anda sangat berharga bagi kami.' });
        } catch (error: any) {
            toast({ title: 'Gagal mengirim', description: error.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center p-6">
                    <div className="mb-4 flex justifying-center mx-auto w-12 h-12 rounded-full bg-red-100 items-center justify-center text-red-600">
                        X
                    </div>
                    <h2 className="text-xl font-bold mb-2">Link Invalid</h2>
                    <p className="text-muted-foreground">Survey tidak ditemukan atau link salah.</p>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md text-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Terima Kasih!</h2>
                    <p className="text-muted-foreground mb-6">Masukan Anda telah berhasil kami terima.</p>
                    <div className="p-4 bg-muted/50 rounded-lg text-sm">
                        Have a nice day, {survey.reviewer_name}!
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <img src="/placeholder.svg" className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary" alt="Logo" /> {/* Replace with actual logo if available */}
                    <h1 className="text-2xl font-bold text-gray-900">Survey Kepuasan Pelanggan</h1>
                    <p className="text-gray-500">Kami ingin mendengar pendapat Anda</p>
                </div>

                <Card className="card-shadow border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle>Halo, {survey.reviewer_name}</CardTitle>
                        <CardDescription>
                            Bagaimana pengalaman Anda bekerja sama dengan kami{survey.project ? ` dalam proyek ${survey.project.name}` : ''}?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Star Rating */}
                        <div className="space-y-4">
                            <Label className="text-base text-gray-700">Seberapa puas Anda dengan layanan kami?</Label>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`h-10 w-10 ${(hoverRating || rating) >= star
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground px-2">
                                <span>Sangat Kecewa</span>
                                <span>Sangat Puas</span>
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="space-y-4">
                            <Label htmlFor="feedback" className="text-base text-gray-700">
                                Apa yang bisa kami tingkatkan? (Opsional)
                            </Label>
                            <Textarea
                                id="feedback"
                                placeholder="Tulis masukan Anda di sini..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>

                        <Button
                            className="w-full h-12 text-lg"
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                'Kirim Masukan'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Badr Interactive
                </div>
            </div>
        </div>
    );
}
