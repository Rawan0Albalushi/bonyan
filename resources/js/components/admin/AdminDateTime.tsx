import { ADMIN_TABLE_EMPTY } from '@/components/admin/AdminDataTable';
import { cn, ENGLISH_NUMERALS_CLASS, formatAdminDate } from '@/lib/utils';

type AdminDateTimeProps = {
    value: string;
    className?: string;
};

export function AdminDateTime({ value, className }: AdminDateTimeProps) {
    const formatted = formatAdminDate(value);

    if (formatted === '—') {
        return <span className={className}>{ADMIN_TABLE_EMPTY}</span>;
    }

    return (
        <time
            dateTime={value}
            title={formatted}
            dir="ltr"
            className={cn(ENGLISH_NUMERALS_CLASS, 'tabular-nums whitespace-nowrap', className)}
        >
            {formatted}
        </time>
    );
}
