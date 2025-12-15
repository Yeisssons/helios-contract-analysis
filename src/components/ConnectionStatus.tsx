'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, AlertTriangle, Loader2 } from 'lucide-react';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        database: { status: string; latency: number };
        storage: { status: string };
    };
}

interface ConnectionStatusProps {
    /** Polling interval in milliseconds (default: 30000 = 30s) */
    pollInterval?: number;
    /** Show detailed status on hover */
    showDetails?: boolean;
}

/**
 * Database Connection Status Indicator
 * Shows real-time connection status to Supabase
 */
export default function ConnectionStatus({
    pollInterval = 30000,
    showDetails = true
}: ConnectionStatusProps) {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);

    const checkHealth = useCallback(async () => {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            setHealth(data);
        } catch {
            setHealth({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                services: {
                    database: { status: 'error', latency: 0 },
                    storage: { status: 'error' },
                },
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, pollInterval);
        return () => clearInterval(interval);
    }, [checkHealth, pollInterval]);

    const getStatusColor = () => {
        if (!health) return 'text-zinc-500';
        switch (health.status) {
            case 'healthy': return 'text-emerald-400';
            case 'degraded': return 'text-amber-400';
            case 'unhealthy': return 'text-red-400';
            default: return 'text-zinc-500';
        }
    };

    const getStatusIcon = () => {
        if (isLoading) {
            return <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />;
        }
        if (!health || health.status === 'unhealthy') {
            return <WifiOff className="w-4 h-4" />;
        }
        if (health.status === 'degraded') {
            return <AlertTriangle className="w-4 h-4" />;
        }
        return <Wifi className="w-4 h-4" />;
    };

    const getStatusText = () => {
        if (isLoading) return 'Checking...';
        if (!health) return 'Unknown';
        switch (health.status) {
            case 'healthy': return 'Connected';
            case 'degraded': return 'Degraded';
            case 'unhealthy': return 'Disconnected';
            default: return 'Unknown';
        }
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => showDetails && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            {/* Status indicator */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/50 border border-zinc-700/50 cursor-default ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-xs font-medium hidden sm:inline">{getStatusText()}</span>
            </div>

            {/* Tooltip with details */}
            {showTooltip && health && (
                <div className="absolute top-full right-0 mt-2 p-3 rounded-xl bg-zinc-900/95 border border-zinc-700/50 shadow-xl backdrop-blur-sm z-50 min-w-[200px]">
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Database</span>
                            <span className={health.services.database.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}>
                                {health.services.database.status}
                            </span>
                        </div>
                        {health.services.database.latency > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Latency</span>
                                <span className="text-zinc-300">{health.services.database.latency}ms</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Storage</span>
                            <span className={health.services.storage.status === 'connected' ? 'text-emerald-400' : 'text-red-400'}>
                                {health.services.storage.status}
                            </span>
                        </div>
                        <div className="pt-2 border-t border-zinc-700/50">
                            <span className="text-zinc-500">
                                Last check: {new Date(health.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
