import { HousePicture } from '@/components/house/HousePicture';
import {
    HOUSE_LIFE_BASE_IMAGE,
    HOUSE_LIFE_COMPLETE_IMAGE,
} from '@/components/house/houseLifeProgress';
import { cn } from '@/lib/utils';

interface HouseFinalImageProps {
    className?: string;
    eager?: boolean;
}

/** Completed home — stone base plus the final house asset used at 100% progress. */
export function HouseFinalImage({ className, eager = true }: HouseFinalImageProps) {
    return (
        <div className={cn('house-final-image relative w-full', className)} aria-hidden>
            <HousePicture
                src={HOUSE_LIFE_BASE_IMAGE}
                eager={eager}
                className="block h-auto w-full"
            />
            <div className="house-final-image-house absolute inset-0">
                <HousePicture src={HOUSE_LIFE_COMPLETE_IMAGE} eager={eager} className="absolute inset-0" />
            </div>
        </div>
    );
}
