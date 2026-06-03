import { cn, ENGLISH_NUMERALS_CLASS } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    className?: string;
}

export function StatCard({ label, value, className }: StatCardProps) {
    return (
        <div className={cn('rounded-xl border border-border bg-card p-4 text-center shadow-sm', className)}>
            <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
            <p className={cn('mt-1 text-lg font-bold text-primary md:text-xl', ENGLISH_NUMERALS_CLASS)}>{value}</p>
        </div>
    );
}
