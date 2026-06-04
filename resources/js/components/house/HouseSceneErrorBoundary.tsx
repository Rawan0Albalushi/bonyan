import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class HouseSceneErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[HouseScene]', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                this.props.fallback ?? (
                    <div className="house-scene-fallback flex h-full min-h-[12rem] w-full flex-col items-center justify-center gap-2 p-6 text-center">
                        <p className="text-sm font-medium text-white/80">{i18n.t('house.scene_unavailable')}</p>
                        <p className="text-xs text-white/50">{i18n.t('house.scene_unavailable_hint')}</p>
                    </div>
                )
            );
        }
        return this.props.children;
    }
}
