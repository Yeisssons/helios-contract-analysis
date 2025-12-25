'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ScreenshotProtection() {
    const { isAdmin, loading } = useAdmin();
    const { user } = useAuth();
    const [isBlurred, setIsBlurred] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (loading || isAdmin) return;

        let blurTimeout: NodeJS.Timeout;

        // Aggressive blur on any focus loss
        const handleBlur = () => {
            setIsBlurred(true);
            clearTimeout(blurTimeout);
        };

        const handleFocus = () => {
            // Delay unblur to catch screenshot tools
            blurTimeout = setTimeout(() => setIsBlurred(false), 300);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            } else {
                blurTimeout = setTimeout(() => setIsBlurred(false), 300);
            }
        };

        // Detect potential screenshot attempt via clipboard
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 3000);
        };

        // Block context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Detect keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block common screenshot shortcuts
            if (
                e.key === 'PrintScreen' ||
                (e.shiftKey && e.metaKey && (e.key === '3' || e.key === '4')) ||
                (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key === 's') ||
                (e.ctrlKey && e.key === 'p')
            ) {
                e.preventDefault();
                setIsBlurred(true);
                setShowWarning(true);
                setTimeout(() => {
                    setIsBlurred(false);
                    setShowWarning(false);
                }, 2000);
                return false;
            }
        };

        // Apply event listeners
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown, true);

        // CSS protections
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';

        // Add protection styles
        const style = document.createElement('style');
        style.id = 'screenshot-protection';
        style.textContent = `
            @media print {
                body * { display: none !important; }
                body::after {
                    content: 'Contenido Protegido © Helios ${new Date().getFullYear()}';
                    display: block !important;
                    text-align: center;
                    font-size: 24px;
                    padding: 100px;
                }
            }
            
            /* Prevent image saving */
            img, video, canvas {
                pointer-events: none;
                user-select: none;
                -webkit-user-drag: none;
                -webkit-touch-callout: none;
            }
            
            /* Make text unselectable */
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            clearTimeout(blurTimeout);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            const styleEl = document.getElementById('screenshot-protection');
            if (styleEl) styleEl.remove();
        };
    }, [isAdmin, loading]);

    if (isAdmin || loading) return null;

    return (
        <>
            {/* Watermark Layer */}
            <div
                className="fixed inset-0 pointer-events-none z-[9997]"
                style={{
                    background: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 150px,
                        rgba(239, 68, 68, 0.04) 150px,
                        rgba(239, 68, 68, 0.04) 300px
                    )`
                }}
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-red-500/[0.08] font-bold text-sm select-none whitespace-nowrap"
                        style={{
                            top: `${(i * 12 + 5) % 95}%`,
                            left: `${(i * 18 + 5) % 90}%`,
                            transform: 'rotate(-45deg)',
                        }}
                    >
                        🔒 HELIOS © {user?.email?.split('@')[0] || 'USER'} - {new Date().toLocaleDateString('es-ES')}
                    </div>
                ))}
            </div>

            {/* Blur Overlay */}
            {isBlurred && (
                <div className="fixed inset-0 z-[9998] backdrop-blur-3xl bg-black/95 flex items-center justify-center">
                    <div className="text-center">
                        <Shield className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-white text-xl font-bold">⚠️ Contenido Protegido</p>
                        <p className="text-zinc-400 text-sm mt-2">Captura de pantalla detectada</p>
                        <p className="text-zinc-600 text-xs mt-4">
                            Usuario: {user?.email} | {new Date().toLocaleString('es-ES')}
                        </p>
                    </div>
                </div>
            )}

            {/* Warning Toast */}
            {showWarning && !isBlurred && (
                <div className="fixed top-20 right-6 z-[9999] px-4 py-3 bg-red-500 text-white rounded-xl shadow-2xl animate-in slide-in-from-right-5 flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">Acción bloqueada - Contenido protegido</span>
                </div>
            )}

            {/* Protection Badge */}
            <div className="fixed bottom-4 left-4 z-[9996] px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium flex items-center gap-2 pointer-events-none select-none">
                <Shield className="w-3 h-3" />
                Protegido
            </div>
        </>
    );
}
