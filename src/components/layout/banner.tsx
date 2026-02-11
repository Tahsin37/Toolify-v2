'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function Banner() {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        const isDismissed = localStorage.getItem('launch-banner-dismissed');
        if (isDismissed) {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('launch-banner-dismissed', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-indigo-600 text-white relative z-50"
                >
                    <div className="container mx-auto px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                        <span>
                            🚀 Launch version — some tools may still be improving. Feedback welcome!
                        </span>
                        <button
                            onClick={handleDismiss}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Dismiss banner"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
