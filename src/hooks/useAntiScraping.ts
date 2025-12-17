'use client';

import { useEffect } from 'react';

/**
 * Anti-scraping & Inspection deterrents
 * - Disables right-click
 * - Prints console warnings
 */
export function useAntiScraping() {
    useEffect(() => {
        // 1. Console Warning for DevTools
        if (process.env.NODE_ENV === 'production') {
            const warningTitle = 'Stop!';
            const warningDesc = 'This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.';

            console.log(
                `%c${warningTitle}`,
                'color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0px black;'
            );
            console.log(
                `%c${warningDesc}`,
                'font-size: 16px;'
            );
        }

        // 2. Disable Right Click (Optional - often annoying, but requested "max difficulty")
        // We will only do this on key elements if needed, but for now global listener is aggressive.
        // Let's stick to just the console warning and CSS no-select for better UX.

    }, []);
}
