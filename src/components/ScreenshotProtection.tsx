'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield } from 'lucide-react';

/**
 * ScreenshotProtection - Prevents screenshots and screen recording for non-admin users
 * 
 * Techniques used:
 * 1. CSS filter blur when PrintScreen/screenshot is detected
 * 2. Visibility API to detect when app loses focus
 * 3. Keyboard event blocking for screenshot shortcuts
 * 4. CSS user-select: none to prevent copying
 */
export default function ScreenshotProtection() {
    const { isAdmin, loading } = useAdmin();
    const [isBlurred, setIsBlurred] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    // Debug logging
    useEffect(() => {
        console.log('[ScreenshotProtection] Component mounted');
        console.log('[ScreenshotProtection] isAdmin:', isAdmin);
        console.log('[ScreenshotProtection] loading:', loading);
    }, [isAdmin, loading]);

    useEffect(() => {
        // Skip protection for admins or during loading
        if (loading || isAdmin) {
            console.log('[ScreenshotProtection] Skipping protection - Admin or loading');
            return;
        }

        console.log('[ScreenshotProtection] ACTIVATING PROTECTION for non-admin user');

        // Block keyboard shortcuts for screenshots
        const handleKeyDown = (e: KeyboardEvent) => {
            // PrintScreen key
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                triggerProtection();
                return false;
            }

            // Windows: Win + Shift + S (Snipping Tool)
            if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                triggerProtection();
                return false;
            }

            // macOS: Cmd + Shift + 3 or 4 (Screenshot)
            if ((e.key === '3' || e.key === '4') && e.shiftKey && e.metaKey) {
                e.preventDefault();
                triggerProtection();
                return false;
            }

            // Cmd/Ctrl + P (Print)
            if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                triggerProtection();
                return false;
            }
        };

        // Detect when window loses focus (potential screen recording or screenshot tool)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setIsBlurred(true);
            } else {
                // Small delay before unblurring to catch screenshot tools
                setTimeout(() => setIsBlurred(false), 100);
            }
        };

        // Detect window blur (could be screenshot tool overlay)
        const handleWindowBlur = () => {
            setIsBlurred(true);
        };

        const handleWindowFocus = () => {
            setTimeout(() => setIsBlurred(false), 100);
        };

        // Block right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        const triggerProtection = () => {
            setIsBlurred(true);
            setShowWarning(true);
            setTimeout(() => {
                setIsBlurred(false);
                setShowWarning(false);
            }, 3000);
        };

        // Add event listeners
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        // Apply CSS protections
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // Add print protection CSS
        const style = document.createElement('style');
        style.id = 'screenshot-protection';
        style.textContent = `
            @media print {
                body * {
                    display: none !important;
                }
                body::after {
                    content: 'Contenido protegido - No se permite imprimir';
                    display: block;
                    text-align: center;
                    font-size: 24px;
                    padding: 100px;
                }
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);

            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';

            const styleEl = document.getElementById('screenshot-protection');
            if (styleEl) styleEl.remove();
        };
    }, [isAdmin, loading]);

    // Admins don't see any protection UI
    if (isAdmin || loading) return null;

    return (
        <>
            {/* Blur overlay when screenshot detected */}
            {isBlurred && (
                <div
                    className="fixed inset-0 z-[9999] backdrop-blur-xl bg-black/80 flex items-center justify-center pointer-events-none"
                    style={{ backdropFilter: 'blur(50px)' }}
                >
                    <div className="text-center">
                        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-white text-lg font-semibold">
                            Contenido Protegido
                        </p>
                        <p className="text-zinc-400 text-sm mt-2">
                            Las capturas de pantalla están deshabilitadas
                        </p>
                    </div>
                </div>
            )}

            {/* Warning toast */}
            {showWarning && !isBlurred && (
                <div className="fixed bottom-6 right-6 z-[9998] px-4 py-3 bg-red-500/90 text-white rounded-xl shadow-2xl animate-in slide-in-from-right-5 duration-300">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            Captura de pantalla bloqueada
                        </span>
                    </div>
                </div>
            )}
        </>
    );
}
