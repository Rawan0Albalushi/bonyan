import { useMemo, type CSSProperties } from 'react';
import { houseAssetSources } from '@/components/house/houseAssetUrls';
import { cn } from '@/lib/utils';

interface HousePictureProps {
    src: string;
    alt?: string;
    className?: string;
    style?: CSSProperties;
    eager?: boolean;
    /** Preload hint for the next construction step. */
    preload?: boolean;
}

export function HousePicture({
    src,
    alt = '',
    className,
    style,
    eager = false,
    preload = false,
}: HousePictureProps) {
    const sources = useMemo(() => houseAssetSources(src), [src]);

    return (
        <picture className={cn('house-picture block h-full w-full', className)} style={style}>
            <source srcSet={sources.webp} type="image/webp" />
            <img
                src={sources.png}
                alt={alt}
                decoding="async"
                loading={eager || preload ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : preload ? 'low' : undefined}
                draggable={false}
                aria-hidden={alt === ''}
                className="house-picture-img h-full w-full object-contain object-center"
            />
        </picture>
    );
}
