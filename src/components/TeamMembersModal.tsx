'use client';

import { useState } from 'react';
import { X, UserPlus, Trash2, Mail, User, Loader2 } from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
}

interface TeamMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamMembers: TeamMember[];
    onAddMember: (member: { name: string; email: string; avatar: string; role: string }) => Promise<void>;
    onDeleteMember: (id: string) => Promise<void>;
    language: 'es' | 'en';
}

const AVATAR_OPTIONS = ['👤', '👩‍💼', '👨‍💼', '👩‍💻', '👨‍💻', '👩‍⚖️', '👨‍⚖️', '👩‍🔬', '👨‍🔬', '👩‍🏫', '👨‍🏫', '🧑‍💼'];

export default function TeamMembersModal({
    isOpen,
    onClose,
    teamMembers,
    onAddMember,
    onDeleteMember,
    language
}: TeamMembersModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('👤');
    const [role, setRole] = useState('member');
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim()) {
            setError(language === 'es' ? 'Nombre y email son requeridos' : 'Name and email are required');
            return;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(language === 'es' ? 'Email inválido' : 'Invalid email');
            return;
        }

        setIsLoading(true);
        try {
            await onAddMember({ name: name.trim(), email: email.trim(), avatar, role });
            setName('');
            setEmail('');
            setAvatar('👤');
            setRole('member');
        } catch (err: any) {
            setError(err.message || 'Error adding member');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(language === 'es' ? '¿Eliminar este miembro?' : 'Delete this member?')) return;

        setDeletingId(id);
        try {
            await onDeleteMember(id);
        } catch (err: any) {
            setError(err.message || 'Error deleting member');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/10 to-blue-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/20">
                            <UserPlus className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {language === 'es' ? 'Gestionar Equipo' : 'Manage Team'}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {teamMembers.length} {language === 'es' ? 'miembros' : 'members'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Team Members List */}
                <div className="max-h-[300px] overflow-y-auto">
                    {teamMembers.length === 0 ? (
                        <div className="p-8 text-center">
                            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">
                                {language === 'es' ? 'No hay miembros en el equipo' : 'No team members yet'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                {language === 'es' ? 'Añade tu primer miembro abajo' : 'Add your first member below'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {teamMembers.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl bg-slate-700/50 rounded-lg p-2">
                                            {member.avatar}
                                        </span>
                                        <div>
                                            <p className="font-medium text-white">{member.name}</p>
                                            <p className="text-sm text-slate-400 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        disabled={deletingId === member.id}
                                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                    >
                                        {deletingId === member.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Member Form */}
                <form onSubmit={handleSubmit} className="p-5 border-t border-slate-700/50 bg-slate-900/50">
                    <h3 className="text-sm font-semibold text-slate-300 mb-3">
                        {language === 'es' ? '+ Añadir Miembro' : '+ Add Member'}
                    </h3>

                    {error && (
                        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={language === 'es' ? 'Nombre' : 'Name'}
                            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                        {/* Avatar Picker */}
                        <div className="flex-1">
                            <label className="block text-xs text-slate-400 mb-1">Avatar</label>
                            <div className="flex flex-wrap gap-1">
                                {AVATAR_OPTIONS.map((a) => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => setAvatar(a)}
                                        className={`p-1 rounded text-lg transition-all ${avatar === a
                                                ? 'bg-emerald-500/20 ring-2 ring-emerald-500'
                                                : 'hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {language === 'es' ? 'Añadiendo...' : 'Adding...'}
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                {language === 'es' ? 'Añadir Miembro' : 'Add Member'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
