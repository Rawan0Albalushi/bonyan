import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminLogin } from '@/api/admin';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await adminLogin(email, password);
            navigate('/admin');
        } catch {
            setError(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-secondary/50 to-background p-4">
            <div className="absolute end-4 top-4">
                <LanguageSwitcher />
            </div>
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <img src="/image/logo.jpeg" alt="Bonyan" className="mx-auto mb-4 h-16 w-16 rounded-xl object-cover" />
                    <CardTitle>{t('admin.login_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('admin.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                dir="ltr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">{t('admin.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? t('common.loading') : t('admin.login')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
