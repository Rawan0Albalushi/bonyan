import { cn, ENGLISH_NUMERALS_CLASS } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: string;
    className?: string;
    highlight?: boolean;
}

export function StatCard({ label, value, className, highlight }: StatCardProps) {
    return (
        <div
            className={cn(
                'card-elevated relative overflow-hidden p-5 text-center transition-transform hover:-translate-y-0.5',
                highlight && 'ring-2 ring-accent/30',
                className,
            )}
        >
            <div
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-light to-accent"
                aria-hidden
            />
            <p className="text-xs font-medium text-muted-foreground md:text-sm">{label}</p>
            <p
                className={cn(
                    'mt-2 text-lg font-extrabold text-gradient-brand md:text-2xl',
                    ENGLISH_NUMERALS_CLASS,
                )}
            >
                {value}
            </p>
        </div>
    );
}
