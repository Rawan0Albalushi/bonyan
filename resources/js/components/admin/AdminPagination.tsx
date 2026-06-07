import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, ENGLISH_NUMERALS_CLASS, formatNumber } from '@/lib/utils';

interface AdminPaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
}

export function AdminPagination({ currentPage, lastPage, onPageChange }: AdminPaginationProps) {
    const { t } = useTranslation();
    const { locale, isRtl } = useLocale();

    if (lastPage <= 1) {
        return null;
    }

    const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
    const NextIcon = isRtl ? ChevronLeft : ChevronRight;

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
            <p className={cn('text-sm text-muted-foreground', ENGLISH_NUMERALS_CLASS)} dir="ltr">
                {t('admin.page_of', {
                    current: formatNumber(currentPage, locale),
                    total: formatNumber(lastPage, locale),
                })}
            </p>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="gap-1"
                >
                    <PrevIcon className="h-4 w-4" />
                    {t('admin.pagination_prev')}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="gap-1"
                >
                    {t('admin.pagination_next')}
                    <NextIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
