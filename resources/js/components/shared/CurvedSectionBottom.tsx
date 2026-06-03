type CurvedSectionBottomProps = {
    className?: string;
};

/** Smooth curve transitioning a colored section into the page background. */
export function CurvedSectionBottom({ className }: CurvedSectionBottomProps) {
    return (
        <div
            className={`pointer-events-none absolute inset-x-0 bottom-0 leading-[0] ${className ?? ''}`}
            aria-hidden
        >
            <svg
                className="block h-10 w-full sm:h-14 md:h-20"
                viewBox="0 0 1440 80"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0,48 C240,80 480,0 720,40 C960,80 1200,16 1440,48 L1440,80 L0,80 Z"
                    className="fill-background"
                />
            </svg>
        </div>
    );
}
