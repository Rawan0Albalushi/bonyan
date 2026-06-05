import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { PUBLIC_HEADER_SPACER_CLASS } from '@/components/shared/PublicHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CancelPage() {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                'bg-page-soft flex flex-1 items-center justify-center py-10 safe-bottom md:py-20',
                PUBLIC_HEADER_SPACER_CLASS,
            )}
        >
            <div className="page-container-tight w-full text-center">
                <XCircle className="mx-auto h-14 w-14 text-muted-foreground/80 sm:h-16 sm:w-16" />
                <h1 className="mt-4 font-display text-2xl font-bold text-gradient-brand sm:text-3xl">
                    {t('payment_cancel.title')}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t('payment_cancel.subtitle')}</p>

                <Card className="mt-8 shadow-brand-lg sm:mt-10">
                    <CardContent className="p-4 sm:p-6">
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
