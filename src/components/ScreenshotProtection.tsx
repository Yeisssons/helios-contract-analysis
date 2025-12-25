'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ScreenshotProtection() {
    const { isAdmin, loading } = useAdmin();
    const { user } = useAuth();
    const [isBlurred, setIsBlurred] = useState(false);

    useEffect(() => {
        if (loading || isAdmin) return;

        let blurTimeout: NodeJS.Timeout;

        // Aggressive blur on any focus loss
        const handleBlur = () => {
            setIsBlurred(true);
            clearTimeout(blurTimeout);
        };

        const handleFocus = () => {
            blurTimeout = setTimeout(() => setIsBlurred(false), 300);
        };

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            } else {
                blurTimeout = setTimeout(() => setIsBlurred(false), 300);
            }
        };

        // Block context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        // Apply event listeners
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);

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
            }
            
            * {
                -webkit-user-select: none;
                -moz-user-select: none;
                user-select: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            clearTimeout(blurTimeout);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            const styleEl = document.getElementById('screenshot-protection');
            if (styleEl) styleEl.remove();
        };
    }, [isAdmin, loading]);

    if (isAdmin || loading) return null;

    const userEmail = user?.email || 'usuario';
    const userName = userEmail.split('@')[0];
    const currentDate = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            {/* PERMANENT Watermark - Email Header */}
            <div className="fixed top-20 right-6 z-[9995] pointer-events-none select-none">
                <div className="px-4 py-2 rounded-lg bg-red-900/20 border border-red-500/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        <div className="text-xs">
                            <div className="text-red-400 font-semibold">{userName}</div>
                            <div className="text-red-500/70 text-[10px]">
                                {currentDate} {currentTime}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PERMANENT Badge - Bottom Left */}
            <div className="fixed bottom-4 left-4 z-[9995] px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium flex items-center gap-2 pointer-events-none select-none backdrop-blur-sm">
                <Shield className="w-3 h-3" />
                🔒 Contenido Protegido
            </div>

            {/* PERMANENT Diagonal Watermarks */}
            <div
                className="fixed inset-0 pointer-events-none z-[9994] select-none overflow-hidden"
                style={{
                    background: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 200px,
                        rgba(239, 68, 68, 0.02) 200px,
                        rgba(239, 68, 68, 0.02) 400px
                    )`
                }}
            >
                {Array.from({ length: 25 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-red-500/[0.04] font-bold text-lg whitespace-nowrap"
                        style={{
                            top: `${(i * 13 + 8) % 90}%`,
                            left: `${(i * 17 + 5) % 85}%`,
                            transform: 'rotate(-45deg)',
                        }}
                    >
                        HELIOS © {userName} {currentDate}
                    </div>
                ))}
            </div>

            {/* DETECTION-BASED Blur Overlay */}
            {isBlurred && (
                <div className="fixed inset-0 z-[9998] backdrop-blur-3xl bg-black/95 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <Shield className="w-24 h-24 text-red-500 mx-auto mb-6 animate-pulse" />
                        <p className="text-white text-2xl font-bold mb-3">
                            ⚠️ Contenido Protegido
                        </p>
                        <p className="text-zinc-300 text-lg mb-4">
                            Captura de pantalla detectada
                        </p>
                        <div className="space-y-2 text-zinc-500">
                            <p className="text-sm">Usuario: {userEmail}</p>
                            <p className="text-xs">{currentDate} - {currentTime}</p>
                            <p className="text-xs mt-4">Helios © {new Date().getFullYear()} - Contenido rastreado</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
