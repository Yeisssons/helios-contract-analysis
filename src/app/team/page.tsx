'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import {
    Users, Plus, Mail, UserPlus, Trash2, Crown,
    ShieldCheck, User, Loader2, ArrowLeft,
    CheckCircle, Clock, AlertCircle, ListTodo
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'member' | 'director' | 'observer';
    status: 'pending' | 'active' | 'removed';
    user_id: string | null;
    joined_at: string | null;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date: string | null;
    assigned_to: string | null;
    team_members?: { email: string } | null;
    contracts?: { file_name: string } | null;
}

interface Team {
    id: string;
    name: string;
    owner_id: string;
    team_members: TeamMember[];
}

function TeamPageContent() {
    const { language } = useLanguage();
    const { user, session } = useAuth();
    const router = useRouter();

    const [team, setTeam] = useState<Team | null>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'members' | 'tasks'>('members');

    // Modal states
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');
    const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', priority: 'medium' });
    const [submitting, setSubmitting] = useState(false);

    const t = {
        title: language === 'es' ? 'Gestión de Equipo' : 'Team Management',
        subtitle: language === 'es' ? 'Administra tu equipo y asigna tareas' : 'Manage your team and assign tasks',
        members: language === 'es' ? 'Miembros' : 'Members',
        tasks: language === 'es' ? 'Tareas' : 'Tasks',
        inviteMember: language === 'es' ? 'Invitar Miembro' : 'Invite Member',
        createTask: language === 'es' ? 'Nueva Tarea' : 'New Task',
        noTeam: language === 'es' ? 'No tienes un equipo' : 'You don\'t have a team',
        createTeam: language === 'es' ? 'Crear Equipo' : 'Create Team',
        upgradeRequired: language === 'es' ? 'Actualiza a Pro para crear equipos' : 'Upgrade to Pro to create teams',
        back: language === 'es' ? 'Volver al inicio' : 'Back to home',
        pending: language === 'es' ? 'Pendiente' : 'Pending',
        active: language === 'es' ? 'Activo' : 'Active',
        owner: language === 'es' ? 'Propietario' : 'Owner',
        admin: 'Admin',
        member: language === 'es' ? 'Miembro' : 'Member',
        email: 'Email',
        role: language === 'es' ? 'Rol' : 'Role',
        status: 'Status',
        actions: language === 'es' ? 'Acciones' : 'Actions',
        remove: language === 'es' ? 'Eliminar' : 'Remove',
        cancel: language === 'es' ? 'Cancelar' : 'Cancel',
        invite: language === 'es' ? 'Invitar' : 'Invite',
        create: language === 'es' ? 'Crear' : 'Create',
        taskTitle: language === 'es' ? 'Título de la tarea' : 'Task title',
        taskDescription: language === 'es' ? 'Descripción' : 'Description',
        assignTo: language === 'es' ? 'Asignar a' : 'Assign to',
        priority: language === 'es' ? 'Prioridad' : 'Priority',
        noTasks: language === 'es' ? 'No hay tareas' : 'No tasks yet',
    };

    const fetchTeam = async () => {
        if (!session?.access_token) return;

        try {
            const response = await fetch('/api/team', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await response.json();

            if (data.ownedTeam) {
                setTeam(data.ownedTeam);
                setMembers(data.ownedTeam.team_members || []);
            }
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        if (!session?.access_token) return;

        try {
            const response = await fetch('/api/team/tasks', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await response.json();
            setTasks(data.tasks || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    useEffect(() => {
        if (session) {
            fetchTeam();
            fetchTasks();
        }
    }, [session]);

    const handleCreateTeam = async () => {
        if (!session?.access_token) return;
        setSubmitting(true);

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: 'Mi Equipo' }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.upgrade) {
                    toast.error(t.upgradeRequired);
                    router.push('/pricing');
                    return;
                }
                throw new Error(data.error);
            }

            toast.success(language === 'es' ? '¡Equipo creado!' : 'Team created!');
            fetchTeam();
        } catch (error) {
            console.error('Error creating team:', error);
            toast.error(language === 'es' ? 'Error al crear equipo' : 'Failed to create team');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInviteMember = async () => {
        if (!session?.access_token || !inviteEmail) return;
        setSubmitting(true);

        try {
            const response = await fetch('/api/team/members', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            toast.success(language === 'es' ? '¡Invitación enviada!' : 'Invitation sent!');
            setShowInviteModal(false);
            setInviteEmail('');
            fetchTeam();
        } catch (error: any) {
            console.error('Error inviting member:', error);
            toast.error(error.message || (language === 'es' ? 'Error al invitar' : 'Failed to invite'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!session?.access_token) return;
        if (!confirm(language === 'es' ? '¿Eliminar este miembro?' : 'Remove this member?')) return;

        try {
            const response = await fetch('/api/team/members', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ memberId }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove');
            }

            toast.success(language === 'es' ? 'Miembro eliminado' : 'Member removed');
            fetchTeam();
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error(language === 'es' ? 'Error al eliminar' : 'Failed to remove');
        }
    };

    const handleCreateTask = async () => {
        if (!session?.access_token || !newTask.title) return;
        setSubmitting(true);

        try {
            const response = await fetch('/api/team/tasks', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTask.title,
                    description: newTask.description,
                    assignedTo: newTask.assignedTo || null,
                    priority: newTask.priority,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create task');
            }

            toast.success(language === 'es' ? '¡Tarea creada!' : 'Task created!');
            setShowTaskModal(false);
            setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium' });
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(language === 'es' ? 'Error al crear tarea' : 'Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, status: string) => {
        if (!session?.access_token) return;

        try {
            await fetch('/api/team/tasks', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId, status }),
            });
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'admin': return <ShieldCheck className="w-4 h-4 text-blue-500" />;
            default: return <User className="w-4 h-4 text-zinc-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">{t.pending}</span>;
            case 'active': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">{t.active}</span>;
            default: return null;
        }
    };

    const getTaskStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'in_progress': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <ListTodo className="w-5 h-5 text-zinc-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'border-l-red-500';
            case 'high': return 'border-l-orange-500';
            case 'medium': return 'border-l-yellow-500';
            default: return 'border-l-zinc-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center relative overflow-hidden">
                {/* Background gradients */}
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 relative z-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <Header />

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Back button */}
                <button
                    onClick={() => router.push('/')}
                    className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t.back}
                </button>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-200 to-white flex items-center gap-3">
                                <Users className="w-8 h-8 text-emerald-400" />
                                {t.title}
                            </span>
                        </h1>
                        <p className="text-zinc-400 mt-1">{t.subtitle}</p>
                    </div>
                </div>

                {/* No Team State */}
                {!team && (
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-12 text-center backdrop-blur-sm">
                        <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">{t.noTeam}</h2>
                        <p className="text-zinc-400 mb-6">{t.upgradeRequired}</p>
                        <button
                            onClick={handleCreateTeam}
                            disabled={submitting}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.createTeam}
                        </button>
                    </div>
                )}

                {/* Team Content */}
                {team && (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-4 mb-6 border-b border-zinc-800">
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'members'
                                    ? 'text-emerald-500 border-b-2 border-emerald-500'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <Users className="w-4 h-4 inline mr-2" />
                                {t.members} ({members.filter(m => m.status !== 'removed').length})
                            </button>
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`pb-4 px-2 font-medium transition-colors ${activeTab === 'tasks'
                                    ? 'text-emerald-500 border-b-2 border-emerald-500'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <ListTodo className="w-4 h-4 inline mr-2" />
                                {t.tasks} ({tasks.length})
                            </button>
                        </div>

                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-white">{t.members}</h2>
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        {t.inviteMember}
                                    </button>
                                </div>

                                <table className="w-full">
                                    <thead className="bg-zinc-800/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">{t.email}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">{t.role}</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase">{t.status}</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400 uppercase">{t.actions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {members.filter(m => m.status !== 'removed').map((member) => (
                                            <tr key={member.id} className="hover:bg-zinc-800/30">
                                                <td className="px-4 py-4 text-white flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-zinc-500" />
                                                    {member.email}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="flex items-center gap-2 text-zinc-300">
                                                        {getRoleIcon(member.role)}
                                                        {member.role === 'owner' ? t.owner : member.role === 'admin' ? t.admin : t.member}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getStatusBadge(member.status)}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {member.role !== 'owner' && (
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title={t.remove}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tasks Tab */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowTaskModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t.createTask}
                                    </button>
                                </div>

                                {tasks.length === 0 ? (
                                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-12 text-center backdrop-blur-sm">
                                        <ListTodo className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-400">{t.noTasks}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`bg-zinc-900/40 border border-white/5 rounded-2xl p-4 border-l-4 backdrop-blur-sm hover:bg-zinc-900/60 transition-colors ${getPriorityColor(task.priority)}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        {getTaskStatusIcon(task.status)}
                                                        <div>
                                                            <h3 className="text-white font-medium">{task.title}</h3>
                                                            {task.description && (
                                                                <p className="text-zinc-400 text-sm mt-1">{task.description}</p>
                                                            )}
                                                            {task.team_members && (
                                                                <p className="text-zinc-500 text-xs mt-2">
                                                                    → {task.team_members.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <select
                                                        value={task.status}
                                                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                                        className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-2 py-1"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="in_progress">In Progress</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold text-white mb-4">{t.inviteMember}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.email}</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.role}</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="member">{t.member}</option>
                                    <option value="admin">{t.admin}</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleInviteMember}
                                disabled={submitting || !inviteEmail}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.invite}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold text-white mb-4">{t.createTask}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.taskTitle}</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder={language === 'es' ? 'Revisar contrato...' : 'Review contract...'}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.taskDescription}</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.assignTo}</label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="">-- {language === 'es' ? 'Sin asignar' : 'Unassigned'} --</option>
                                    {members.filter(m => m.status === 'active').map((member) => (
                                        <option key={member.id} value={member.id}>{member.email}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">{t.priority}</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                                >
                                    <option value="low">{language === 'es' ? 'Baja' : 'Low'}</option>
                                    <option value="medium">{language === 'es' ? 'Media' : 'Medium'}</option>
                                    <option value="high">{language === 'es' ? 'Alta' : 'High'}</option>
                                    <option value="urgent">{language === 'es' ? 'Urgente' : 'Urgent'}</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={submitting || !newTask.title}
                                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.create}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TeamPage() {
    return (
        <LanguageProvider>
            <TeamPageContent />
        </LanguageProvider>
    );
}
