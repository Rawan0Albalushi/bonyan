import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CancelPage() {
    const { t } = useTranslation();

    return (
        <div className="bg-page-soft py-12 md:py-20">
            <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
                <XCircle className="mx-auto h-16 w-16 text-muted-foreground/80" />
                <h1 className="mt-4 font-display text-3xl font-bold text-gradient-brand">{t('payment_cancel.title')}</h1>
                <p className="mt-2 text-muted-foreground">{t('payment_cancel.subtitle')}</p>

                <Card className="mt-10 shadow-brand-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Link to="/donate">
                                <Button variant="accent" className="w-full sm:w-auto">
                                    {t('payment_cancel.try_again')}
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="outline" className="w-full sm:w-auto">
                                    {t('success.back_home')}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
