'use client';

import { useEffect } from 'react';

/**
 * Anti-scraping & Inspection deterrents
 * - Disables right-click for non-admin users
 * - Prints console warnings
 * @param isAdmin - If true, bypass all restrictions
 */
export function useAntiScraping(isAdmin: boolean = false) {
    useEffect(() => {
        // Skip ALL restrictions for admins
        if (isAdmin) {
            console.log('%c🔓 Admin Mode: Developer tools enabled', 'color: #10b981; font-weight: bold;');
            return;
        }

        // 1. Console Warning for DevTools (non-admin, production only)
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

        // 2. Disable Right Click & Keyboard Shortcuts (non-admin only)
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Shortcuts: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+P
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p'))
            ) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isAdmin]);
}
