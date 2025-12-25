'use client';

import { useEffect, useState, useRef } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ScreenshotProtection - Makes screenshots less useful for non-admin users
 * 
 * Techniques used:
 * 1. Watermark overlay with user email
 * 2. Aggressive blur when window loses focus
 * 3. Content hiding when devtools are opened
 * 4. CSS user-select: none to prevent copying
 * 5. Print protection
 */
export default function ScreenshotProtection() {
    const { isAdmin, loading } = useAdmin();
    const { user } = useAuth();
    const [isBlurred, setIsBlurred] = useState(false);
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const watermarkRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Skip protection for admins or during loading
        if (loading || isAdmin) return;

        // Blur content when window loses focus (potential screenshot)
        const handleVisibilityChange = () => {
            setIsBlurred(document.visibilityState === 'hidden');
        };

        const handleWindowBlur = () => setIsBlurred(true);
        const handleWindowFocus = () => setIsBlurred(false);

        // Detect DevTools opening (common for taking clean screenshots)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            setDevToolsOpen(widthThreshold || heightThreshold);
        };

        // Block right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Add event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);
        window.addEventListener('resize', detectDevTools);
        document.addEventListener('contextmenu', handleContextMenu);

        // Initial devtools check
        detectDevTools();

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
                    content: 'Contenido Protegido - Helios © ${new Date().getFullYear()}';
                    display: block !important;
                    text-align: center;
                    font-size: 24px;
                    padding: 100px;
                    color: #000;
                }
            }
            
            /* Prevent drag and drop */
            img, video {
                pointer-events: none;
                user-select: none;
                -webkit-user-drag: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            window.removeEventListener('resize', detectDevTools);
            document.removeEventListener('contextmenu', handleContextMenu);

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
            {/* Watermark Grid - Always visible, makes screenshots identifiable */}
            <div
                ref={watermarkRef}
                className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 200px,
                        rgba(239, 68, 68, 0.03) 200px,
                        rgba(239, 68, 68, 0.03) 400px
                    )`
                }}
            >
                {/* Diagonal watermarks */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-red-500/10 font-bold text-xl select-none"
                        style={{
                            top: `${(i * 15) % 100}%`,
                            left: `${(i * 20) % 100}%`,
                            transform: 'rotate(-45deg)',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        🔒 HELIOS © {user?.email || 'Protected'} {new Date().toLocaleDateString()}
                    </div>
                ))}
            </div>

            {/* Blur overlay when window loses focus or DevTools detected */}
            {(isBlurred || devToolsOpen) && (
                <div
                    className="fixed inset-0 z-[9998] backdrop-blur-3xl bg-black/90 flex items-center justify-center pointer-events-none"
                >
                    <div className="text-center">
                        <Shield className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                        <p className="text-white text-2xl font-bold mb-3">
                            ⚠️ Contenido Protegido
                        </p>
                        <p className="text-zinc-300 text-lg">
                            {devToolsOpen
                                ? 'Herramientas de desarrollo detectadas'
                                : 'Captura de pantalla bloqueada'
                            }
                        </p>
                        <p className="text-zinc-500 text-sm mt-4">
                            Usuario: {user?.email}
                        </p>
                        <p className="text-zinc-600 text-xs mt-2">
                            Helios © {new Date().getFullYear()} - Contenido bajo protección
                        </p>
                    </div>
                </div>
            )}

            {/* Persistent warning badge */}
            <div className="fixed bottom-4 left-4 z-[9996] px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium flex items-center gap-2 pointer-events-none">
                <Shield className="w-3 h-3" />
                Contenido Protegido
            </div>
        </>
    );
}
