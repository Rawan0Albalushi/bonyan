import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HouseDonationToastProps {
    visible: boolean;
    messageKey: string;
    messageParams?: Record<string, string | number>;
}

export function HouseDonationToast({
    visible,
    messageKey,
    messageParams,
}: HouseDonationToastProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {visible && (
                <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="mx-auto mt-2 max-w-md rounded-full border border-primary/15 bg-card/95 px-4 py-2 text-center text-xs font-semibold text-primary shadow-sm backdrop-blur-sm sm:text-sm"
                >
                    {t(messageKey, messageParams)}
                </motion.p>
            )}
        </AnimatePresence>
    );
}
