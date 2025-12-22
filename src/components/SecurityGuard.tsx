'use client';

import { useAntiScraping } from '@/hooks/useAntiScraping';
import { useAdmin } from '@/hooks/useAdmin';

export default function SecurityGuard() {
    const { isAdmin, loading } = useAdmin();

    // Wait for admin check to complete, then apply appropriate restrictions
    // During loading, we don't block anything to avoid flicker
    useAntiScraping(loading ? true : isAdmin);

    return null; // This component renders nothing, just runs the security hook
}
