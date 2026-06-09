import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel: string;
    variant?: 'destructive' | 'default';
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'destructive',
    loading = false,
    onConfirm,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        void onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="items-center gap-4 sm:flex-row sm:items-start sm:text-start">
                    <div
                        className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border',
                            variant === 'destructive'
                                ? 'border-destructive/20 bg-destructive/10 text-destructive'
                                : 'border-primary/20 bg-primary/10 text-primary',
                        )}
                    >
                        <AlertTriangle className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="space-y-1.5">
                        <DialogTitle>{title}</DialogTitle>
                        {description ? <DialogDescription>{description}</DialogDescription> : null}
                    </div>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
