import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

export class AppErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, message: '' };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, message: error.message };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[App]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-center safe-top safe-bottom sm:gap-5 sm:p-8">
                    <h1 className="font-display text-lg font-bold text-destructive sm:text-xl">{i18n.t('error.title')}</h1>
                    <p className="max-w-md text-sm text-muted-foreground">{this.state.message}</p>
                    <button
                        type="button"
                        className="w-full max-w-xs rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground sm:w-auto"
                        onClick={() => window.location.reload()}
                    >
                        {i18n.t('error.reload')}
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
