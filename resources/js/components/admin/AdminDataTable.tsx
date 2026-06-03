import { createContext, useContext, type ReactNode } from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import { cn, ENGLISH_NUMERALS_CLASS } from '@/lib/utils';

/** Column content type — drives matching alignment on header and body cells. */
export type AdminColumnVariant = 'text' | 'numeric' | 'center';

type AdminTableContextValue = {
    isRtl: boolean;
};

const AdminTableContext = createContext<AdminTableContextValue>({ isRtl: false });

function useAdminTable() {
    return useContext(AdminTableContext);
}

function variantClasses(variant: AdminColumnVariant, isRtl: boolean): { className: string; dir?: 'ltr' | 'rtl' } {
    const align = isRtl ? 'text-right' : 'text-left';

    switch (variant) {
        case 'numeric':
            // dir=ltr keeps numbers/dates readable; align follows page direction
            return {
                className: cn(align, ENGLISH_NUMERALS_CLASS, 'tabular-nums whitespace-nowrap'),
                dir: 'ltr',
            };
        case 'center':
            return { className: 'text-center', dir: undefined };
        case 'text':
        default:
            return { className: align, dir: isRtl ? 'rtl' : undefined };
    }
}

export const ADMIN_TABLE_EMPTY = '—';

export function AdminDataTable({ children, className }: { children: ReactNode; className?: string }) {
    const { isRtl } = useLocale();

    return (
        <AdminTableContext.Provider value={{ isRtl }}>
            <div className={cn('overflow-x-auto rounded-md border border-border', className)}>
                <table
                    dir={isRtl ? 'rtl' : 'ltr'}
                    className="w-full min-w-[720px] border-collapse text-sm"
                >
                    {children}
                </table>
            </div>
        </AdminTableContext.Provider>
    );
}

export function AdminTableColGroup({ widths }: { widths: string[] }) {
    return (
        <colgroup>
            {widths.map((width, i) => (
                <col key={i} style={{ width }} />
            ))}
        </colgroup>
    );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
    return (
        <thead>
            <tr className="border-b border-border bg-muted/50">{children}</tr>
        </thead>
    );
}

export function AdminTableTh({
    children,
    variant = 'text',
    className,
}: {
    children: ReactNode;
    variant?: AdminColumnVariant;
    className?: string;
}) {
    const { isRtl } = useAdminTable();
    const { className: alignClass, dir } = variantClasses(variant, isRtl);

    return (
        <th
            scope="col"
            dir={dir}
            className={cn(
                'px-4 py-3 text-xs font-semibold text-muted-foreground',
                alignClass,
                className,
            )}
        >
            {children}
        </th>
    );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-border/60">{children}</tbody>;
}

export function AdminTableRow({ children, striped }: { children: ReactNode; striped?: boolean }) {
    return (
        <tr className={cn('transition-colors hover:bg-muted/30', striped && 'even:bg-muted/20')}>{children}</tr>
    );
}

export function AdminTableTd({
    children,
    variant = 'text',
    className,
    muted,
    mono,
    truncate,
}: {
    children: ReactNode;
    variant?: AdminColumnVariant;
    className?: string;
    muted?: boolean;
    mono?: boolean;
    truncate?: boolean;
}) {
    const { isRtl } = useAdminTable();
    const { className: alignClass, dir } = variantClasses(variant, isRtl);

    return (
        <td
            dir={dir}
            className={cn(
                'px-4 py-3 align-middle',
                alignClass,
                muted && 'text-muted-foreground',
                mono && 'font-mono text-xs',
                truncate && 'max-w-0',
                className,
            )}
        >
            {truncate ? <span className="block truncate text-inherit">{children}</span> : children}
        </td>
    );
}

export function AdminTableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
    return (
        <tr>
            <td colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
                {message}
            </td>
        </tr>
    );
}
