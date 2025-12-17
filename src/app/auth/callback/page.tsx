'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const { session } = useAuth();

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session, router]);

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-zinc-400 text-sm">Autenticando...</p>
            </div>
        </div>
    );
}
