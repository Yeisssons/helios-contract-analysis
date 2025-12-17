'use client';

import { useAntiScraping } from '@/hooks/useAntiScraping';

export default function SecurityGuard() {
    useAntiScraping();
    return null; // This component renders nothing, just runs the security hook
}
