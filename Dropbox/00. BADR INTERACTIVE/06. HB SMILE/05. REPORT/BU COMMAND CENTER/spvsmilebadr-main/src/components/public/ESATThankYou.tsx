import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export function ESATThankYou() {
    const { token } = useParams<{ token: string }>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="p-8 max-w-md w-full text-center">
                <div className="mb-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Terima Kasih!</h1>
                    <p className="text-muted-foreground">
                        Jawaban Anda telah berhasil dikirim.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900">
                        Masukan Anda sangat berharga untuk membantu kami meningkatkan kepuasan dan produktivitas tim.
                    </p>
                </div>

                <p className="text-sm text-muted-foreground">
                    Anda dapat menutup halaman ini sekarang.
                </p>
            </Card>
        </div>
    );
}
