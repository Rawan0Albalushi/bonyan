import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminMobileList({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('divide-y divide-border/60 md:hidden', className)}>
            {children}
        </div>
    );
}

export function AdminMobileListItem({ children, className }: { children: ReactNode; className?: string }) {
    return <article className={cn('space-y-3 p-4', className)}>{children}</article>;
}

export function AdminMobileField({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('space-y-1', className)}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className="text-sm text-foreground">{children}</div>
        </div>
    );
}

export function AdminMobileGrid({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
