'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

/**
 * Skeleton component for loading states
 * Shows a pulsing gray box as placeholder
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-lg bg-white/5',
                className
            )}
        />
    );
}

/**
 * Skeleton for a single table row
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === 0 ? 'w-48' : i === columns - 1 ? 'w-20' : 'w-24'
                    )}
                />
            ))}
        </div>
    );
}

/**
 * Skeleton for a stats card
 */
export function StatsCardSkeleton() {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
        </div>
    );
}

/**
 * Skeleton for contract details page
 */
export function ContractDetailSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left - Data points */}
                <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            <Skeleton className="h-3 w-24 mb-2" />
                            <Skeleton className="h-5 w-full" />
                        </div>
                    ))}
                </div>

                {/* Right - PDF placeholder */}
                <Skeleton className="h-[600px] rounded-xl" />
            </div>
        </div>
    );
}

/**
 * Skeleton for dashboard stats grid
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatsCardSkeleton key={i} />
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <Skeleton className="h-5 w-32" />
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
