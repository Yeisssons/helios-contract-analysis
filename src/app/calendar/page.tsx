'use client';

import { useState, useEffect, useMemo } from 'react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import TeamMembersModal from '@/components/TeamMembersModal';
import { supabase } from '@/lib/supabase';
import {
    Calendar as CalendarIcon,
    List,
    Clock,
    Download,
    Filter,
    Search,
    AlertTriangle,
    CheckCircle2,
    Circle,
    TrendingUp,
    FileText,
    ArrowLeft,
    DollarSign,
    Shield,
    Users,
    Users2,
    Building2,
    Plus,
    UserPlus,
    X,
    Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalendarDocument {
    id: string;
    fileName: string;
    effectiveDate: string;
    renewalDate: string;
    noticePeriodDays: number;
    contractType: string;
    sector?: string;
    riskLevel?: string;
    extractedData?: Record<string, string>;
}

// Event type definitions with colors
interface CalendarEvent {
    id: string;
    documentId: string;
    fileName: string;
    sector?: string;
    eventType: 'renewal' | 'payment' | 'audit' | 'review' | 'deadline' | 'expiry' | 'other';
    date: Date;
    title: string;
    description?: string;
}

// Custom task interface (user-created tasks)
interface CustomTask {
    id: string;
    title: string;
    description: string;
    date: Date;
    eventType: CalendarEvent['eventType'];
    assignedTo?: string;
    assignedToName?: string;
    isDbEvent?: boolean;
}

// Team member interface for real members from database
interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
}

const EVENT_TYPE_CONFIG = {
    renewal: { color: 'emerald', icon: '🔄', labelEs: 'Renovación', labelEn: 'Renewal' },
    payment: { color: 'blue', icon: '💰', labelEs: 'Pago', labelEn: 'Payment' },
    audit: { color: 'purple', icon: '🔍', labelEs: 'Auditoría', labelEn: 'Audit' },
    review: { color: 'amber', icon: '📋', labelEs: 'Revisión', labelEn: 'Review' },
    deadline: { color: 'red', icon: '⏰', labelEs: 'Fecha límite', labelEn: 'Deadline' },
    expiry: { color: 'orange', icon: '📅', labelEs: 'Vencimiento', labelEn: 'Expiry' },
    other: { color: 'slate', icon: '📌', labelEs: 'Otro', labelEn: 'Other' }
};

// Keywords to detect event types from data point names
const EVENT_TYPE_KEYWORDS: Record<string, RegExp> = {
    renewal: /renovación|renewal|prórroga|extension/i,
    payment: /pago|payment|factura|invoice|cuota|prima|renta/i,
    audit: /auditoría|audit|inspección|inspection/i,
    review: /revisión|review|evaluación|assessment/i,
    deadline: /límite|deadline|plazo|notice|preaviso/i,
    expiry: /vencimiento|expiry|caducidad|vigencia|effective/i
};

function CalendarPageContent() {
    const { language } = useLanguage();
    const router = useRouter();
    const [documents, setDocuments] = useState<CalendarDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'timeline'>('agenda');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'urgent' | 'upcoming' | 'active'>('all');

    const [user, setUser] = useState<any>(null);
    const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Team members state
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

    // Auth check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
    }, [supabase]);

    // Fetch db events
    useEffect(() => {
        if (!user) return;

        const fetchEvents = async () => {
            try {
                const res = await fetch(`/api/events?user_id=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        const mappedEvents: CustomTask[] = data.map((e: any) => ({
                            id: e.id,
                            title: e.title,
                            description: e.description || '',
                            date: new Date(e.date),
                            eventType: 'other' as const, // Cast to literal
                            isDbEvent: true
                        }));
                        setCustomTasks(mappedEvents);
                    }
                }
            } catch (err) {
                console.error("Failed to load events", err);
            }
        };

        fetchEvents();
    }, [user, refreshTrigger]);

    // Fetch team members
    useEffect(() => {
        if (!user) return;

        const fetchTeamMembers = async () => {
            setLoadingTeamMembers(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.access_token) return;

                const res = await fetch('/api/team-members', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });

                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setTeamMembers(result.data);
                    }
                }
            } catch (err) {
                console.error("Failed to load team members", err);
            } finally {
                setLoadingTeamMembers(false);
            }
        };

        fetchTeamMembers();
    }, [user, refreshTrigger]);

    // Team member CRUD handlers
    const handleAddTeamMember = async (member: { name: string; email: string; avatar: string; role: string }) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');

        const res = await fetch('/api/team-members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(member)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to add member');
        }

        setRefreshTrigger(prev => prev + 1);
    };

    const handleDeleteTeamMember = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Not authenticated');

        const res = await fetch(`/api/team-members?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to delete member');
        }

        setRefreshTrigger(prev => prev + 1);
    };

    // Task creation modal states
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        date: new Date(),
        eventType: 'other' as CalendarEvent['eventType'],
        assignedTo: ''
    });

    const handleCreateTask = async () => {
        if (!newTask.title || !newTask.date || !user) return;

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTask.title,
                    date: newTask.date,
                    description: newTask.description,
                    user_id: user.id,
                    color: 'blue',
                    assigned_to_member: newTask.assignedTo || null,
                    language: language
                })
            });

            if (res.ok) {
                // If a team member is assigned, open Gmail with the email composed
                if (newTask.assignedTo) {
                    const assignedMember = teamMembers.find((m: TeamMember) => m.id === newTask.assignedTo);
                    if (assignedMember) {
                        const formattedDate = new Date(newTask.date).toLocaleDateString(
                            language === 'es' ? 'es-ES' : 'en-US',
                            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                        );

                        const subject = language === 'es'
                            ? `📋 Nueva tarea asignada: ${newTask.title}`
                            : `📋 New task assigned: ${newTask.title}`;

                        const body = language === 'es'
                            ? `Hola ${assignedMember.name},

Se te ha asignado una nueva tarea:

📋 Tarea: ${newTask.title}
📅 Fecha: ${formattedDate}
${newTask.description ? `📝 Descripción: ${newTask.description}` : ''}

Por favor, revisa el calendario para más detalles.

Saludos,
Contract Manager`
                            : `Hello ${assignedMember.name},

You have been assigned a new task:

📋 Task: ${newTask.title}
📅 Date: ${formattedDate}
${newTask.description ? `📝 Description: ${newTask.description}` : ''}

Please check the calendar for more details.

Best regards,
Contract Manager`;

                        // Open Gmail compose window
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(assignedMember.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        window.open(gmailUrl, '_blank');
                    }
                }

                setRefreshTrigger(prev => prev + 1);
                setShowTaskModal(false);
                setNewTask({ title: '', description: '', date: new Date(), eventType: 'other', assignedTo: '' });
            }
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Error creating task');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure?')) return;

        try {
            await fetch(`/api/events?id=${taskId}`, { method: 'DELETE' });
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error('Error deleting task', error);
        }
    };
    const [filterEventType, setFilterEventType] = useState<string>('all');
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Load documents from API
    useEffect(() => {
        async function fetchDocuments() {
            try {
                const { supabase } = await import('@/lib/supabase');
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) return;

                const response = await fetch('/api/contracts', {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });
                const result = await response.json();

                if (result.success && result.data) {
                    setDocuments(result.data.map((doc: any) => ({
                        id: doc.id,
                        fileName: doc.fileName || doc.file_name,
                        effectiveDate: doc.effectiveDate || doc.effective_date,
                        renewalDate: doc.renewalDate || doc.renewal_date,
                        noticePeriodDays: doc.noticePeriodDays || doc.notice_period_days || 30,
                        contractType: doc.contractType || doc.contract_type || 'General',
                        sector: doc.sector,
                        riskLevel: doc.riskLevel || doc.risk_level,
                        extractedData: doc.extractedData || doc.extracted_data || {}
                    })));
                }
            } catch (error) {
                console.error('Error loading documents:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDocuments();
    }, []);

    // Extract calendar events from documents
    const calendarEvents = useMemo(() => {
        const events: CalendarEvent[] = [];

        documents.forEach(doc => {
            // Always add renewal date as an event
            if (doc.renewalDate) {
                const renewalDate = new Date(doc.renewalDate);
                if (!isNaN(renewalDate.getTime())) {
                    events.push({
                        id: `${doc.id}-renewal`,
                        documentId: doc.id,
                        fileName: doc.fileName,
                        sector: doc.sector,
                        eventType: 'renewal',
                        date: renewalDate,
                        title: `${language === 'es' ? 'Renovación' : 'Renewal'}: ${doc.fileName}`,
                        description: doc.contractType
                    });
                }
            }

            // Extract dates from extractedData
            if (doc.extractedData) {
                Object.entries(doc.extractedData).forEach(([key, value]) => {
                    if (!value || typeof value !== 'string') return;

                    // Try to parse as date - look for date patterns
                    const datePatterns = [
                        /\d{4}-\d{2}-\d{2}/,  // YYYY-MM-DD
                        /\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY or MM/DD/YYYY
                        /\d{1,2} de \w+ de \d{4}/i, // Spanish date format
                    ];

                    let dateStr: string | null = null;
                    for (const pattern of datePatterns) {
                        const match = value.match(pattern);
                        if (match) {
                            dateStr = match[0];
                            break;
                        }
                    }

                    if (dateStr) {
                        const parsedDate = new Date(dateStr);
                        if (!isNaN(parsedDate.getTime())) {
                            // Determine event type from key
                            let eventType: CalendarEvent['eventType'] = 'other';
                            for (const [type, regex] of Object.entries(EVENT_TYPE_KEYWORDS)) {
                                if (regex.test(key)) {
                                    eventType = type as CalendarEvent['eventType'];
                                    break;
                                }
                            }

                            events.push({
                                id: `${doc.id}-${key}`,
                                documentId: doc.id,
                                fileName: doc.fileName,
                                sector: doc.sector,
                                eventType,
                                date: parsedDate,
                                title: key,
                                description: value
                            });
                        }
                    }
                });
            }
        });

        // Add user created tasks
        customTasks.forEach(task => {
            events.push({
                id: task.id,
                documentId: 'custom',
                fileName: language === 'es' ? 'Tarea Manual' : 'Manual Task',
                eventType: task.eventType || 'other',
                date: task.date,
                title: task.title,
                description: task.description
            });
        });

        // Sort by date
        return events.sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [documents, language, customTasks]); // Added customTasks dependecy

    // Calculate days until date
    const getDaysUntil = (date: Date) => {
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Calculate days until renewal
    const getDaysUntilRenewal = (renewalDate: string) => {
        const renewal = new Date(renewalDate);
        return getDaysUntil(renewal);
    };

    // Get status of document
    const getDocumentStatus = (doc: CalendarDocument) => {
        const days = getDaysUntilRenewal(doc.renewalDate);
        if (days < 0) return 'expired';
        if (days <= doc.noticePeriodDays) return 'urgent';
        if (days <= doc.noticePeriodDays * 2) return 'upcoming';
        return 'active';
    };

    // Get event status
    const getEventStatus = (event: CalendarEvent) => {
        const days = getDaysUntil(event.date);
        if (days < 0) return 'expired';
        if (days <= 7) return 'urgent';
        if (days <= 30) return 'upcoming';
        return 'active';
    };

    // Filter and search documents (for backwards compatibility)
    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.contractType.toLowerCase().includes(searchTerm.toLowerCase());

            const status = getDocumentStatus(doc);
            const matchesFilter = filterStatus === 'all' || status === filterStatus;

            return matchesSearch && matchesFilter;
        }).sort((a, b) => {
            const daysA = getDaysUntilRenewal(a.renewalDate);
            const daysB = getDaysUntilRenewal(b.renewalDate);
            return daysA - daysB;
        });
    }, [documents, searchTerm, filterStatus]);

    // Filter events
    const filteredEvents = useMemo(() => {
        return calendarEvents.filter(event => {
            const matchesSearch = event.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.title.toLowerCase().includes(searchTerm.toLowerCase());

            const status = getEventStatus(event);
            const matchesStatus = filterStatus === 'all' || status === filterStatus;
            const matchesType = filterEventType === 'all' || event.eventType === filterEventType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [calendarEvents, searchTerm, filterStatus, filterEventType]);

    // Stats
    const stats = useMemo(() => {
        const urgent = documents.filter(doc => getDocumentStatus(doc) === 'urgent').length;
        const upcoming = documents.filter(doc => getDocumentStatus(doc) === 'upcoming').length;
        const active = documents.filter(doc => getDocumentStatus(doc) === 'active').length;
        const expired = documents.filter(doc => getDocumentStatus(doc) === 'expired').length;

        // Event type counts
        const eventTypeCounts = Object.keys(EVENT_TYPE_CONFIG).reduce((acc, type) => {
            acc[type] = calendarEvents.filter(e => e.eventType === type).length;
            return acc;
        }, {} as Record<string, number>);

        return { urgent, upcoming, active, expired, total: documents.length, totalEvents: calendarEvents.length, eventTypeCounts };
    }, [documents, calendarEvents]);

    // Export calendar - using events
    const handleExportCalendar = () => {
        const icsContent = filteredEvents.map(event => {
            const formatted = event.date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const typeConfig = EVENT_TYPE_CONFIG[event.eventType];
            const typeLabel = language === 'es' ? typeConfig.labelEs : typeConfig.labelEn;

            return `BEGIN:VEVENT
UID:${event.id}@ysnsolutions.com
DTSTAMP:${formatted}
DTSTART:${formatted}
SUMMARY:${typeConfig.icon} ${typeLabel}: ${event.fileName}
DESCRIPTION:${event.title}: ${event.description || ''}
END:VEVENT`;
        }).join('\n');

        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YSN Solutions//Calendar//EN
${icsContent}
END:VCALENDAR`;

        const blob = new Blob([ics], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eventos_calendario.ics';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Handle clicking on a date to create a task
    const handleOpenTaskModal = (date: Date) => {
        setSelectedDate(date);
        setNewTask({
            title: '',
            description: '',
            eventType: 'other',
            assignedTo: '',
            date: date // Set the date
        });
        setShowTaskModal(true); // Fixed
    };



    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            expired: 'bg-red-500/20 text-red-300 border-red-500/30',
            urgent: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            upcoming: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };

        const labels = {
            expired: language === 'es' ? 'Vencido' : 'Expired',
            urgent: language === 'es' ? 'Urgente' : 'Urgent',
            upcoming: language === 'es' ? 'Próximo' : 'Upcoming',
            active: language === 'es' ? 'Activo' : 'Active'
        };

        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const EventTypeBadge = ({ type }: { type: CalendarEvent['eventType'] }) => {
        const config = EVENT_TYPE_CONFIG[type];
        const colorClasses = {
            emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            red: 'bg-red-500/20 text-red-300 border-red-500/30',
            orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
        };

        return (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colorClasses[config.color as keyof typeof colorClasses]}`}>
                {config.icon} {language === 'es' ? config.labelEs : config.labelEn}
            </span>
        );
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Header />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/')}
                        className="mb-6 flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        {language === 'es' ? 'Volver al inicio' : 'Back to home'}
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-xl bg-emerald-500/20">
                                        <CalendarIcon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {language === 'es' ? 'Calendario de Renovaciones' : 'Renewal Calendar'}
                                    </h1>
                                </div>
                                <p className="text-slate-400 ml-14">
                                    {language === 'es'
                                        ? 'Visualiza y gestiona las fechas críticas de tus documentos'
                                        : 'Visualize and manage critical dates for your documents'}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Team Management Button */}
                                <button
                                    onClick={() => setShowTeamModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    <Users2 className="w-4 h-4" />
                                    {language === 'es' ? 'Equipo' : 'Team'}
                                    {teamMembers.length > 0 && (
                                        <span className="text-xs bg-blue-500 px-1.5 py-0.5 rounded-full">
                                            {teamMembers.length}
                                        </span>
                                    )}
                                </button>

                                {/* Export Button */}
                                <button
                                    onClick={handleExportCalendar}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    {language === 'es' ? 'Exportar .ICS' : 'Export .ICS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Total</span>
                                <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                        </div>

                        <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 backdrop-blur-xl border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-red-300 text-sm">{language === 'es' ? 'Vencidos' : 'Expired'}</span>
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                            </div>
                            <p className="text-2xl font-bold text-red-300">{stats.expired}</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 backdrop-blur-xl border border-orange-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-orange-300 text-sm">{language === 'es' ? 'Urgentes' : 'Urgent'}</span>
                                <Clock className="w-4 h-4 text-orange-400" />
                            </div>
                            <p className="text-2xl font-bold text-orange-300">{stats.urgent}</p>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yellow-300 text-sm">{language === 'es' ? 'Próximos' : 'Upcoming'}</span>
                                <TrendingUp className="w-4 h-4 text-yellow-400" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-300">{stats.upcoming}</p>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-emerald-300 text-sm">{language === 'es' ? 'Activos' : 'Active'}</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                            <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={language === 'es' ? 'Buscar documentos...' : 'Search documents...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>

                        {/* Filter */}
                        <div className="flex gap-2">
                            {[{ value: 'all', label: language === 'es' ? 'Todos' : 'All' },
                            { value: 'urgent', label: language === 'es' ? 'Urgentes' : 'Urgent' },
                            { value: 'upcoming', label: language === 'es' ? 'Próximos' : 'Upcoming' },
                            { value: 'active', label: language === 'es' ? 'Activos' : 'Active' }
                            ].map(filter => (
                                <button
                                    key={filter.value}
                                    onClick={() => setFilterStatus(filter.value as any)}
                                    className={`px-4 py-2 rounded-lg transition-all ${filterStatus === filter.value
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex gap-2 bg-slate-800/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('agenda')}
                                className={`p-2 rounded transition-colors ${viewMode === 'agenda' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                title="Agenda"
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`p-2 rounded transition-colors ${viewMode === 'timeline' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                title="Timeline"
                            >
                                <Clock className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded transition-colors ${viewMode === 'calendar' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                title="Calendar"
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="text-center py-20">
                            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">
                                {language === 'es' ? 'No se encontraron documentos' : 'No documents found'}
                            </p>
                        </div>
                    ) : (
                        /* Agenda View */
                        viewMode === 'agenda' && (
                            <div className="space-y-3">
                                {filteredDocuments.map(doc => {
                                    const status = getDocumentStatus(doc);
                                    const daysUntil = getDaysUntilRenewal(doc.renewalDate);

                                    return (
                                        <div
                                            key={doc.id}
                                            onClick={() => router.push(`/contracts/${doc.id}`)}
                                            className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Circle className={`w-3 h-3 ${status === 'expired' ? 'text-red-500 fill-red-500' :
                                                            status === 'urgent' ? 'text-orange-500 fill-orange-500' :
                                                                status === 'upcoming' ? 'text-yellow-500 fill-yellow-500' :
                                                                    'text-emerald-500 fill-emerald-500'
                                                            }`} />
                                                        <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                                                            {doc.fileName}
                                                        </h3>
                                                        <StatusBadge status={status} />
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-slate-400 ml-6">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="w-4 h-4" />
                                                            {doc.contractType}
                                                        </span>
                                                        {doc.sector && (
                                                            <span className="flex items-center gap-1">
                                                                •
                                                                {doc.sector}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {language === 'es' ? 'Renovación:' : 'Renewal:'}
                                                            <span className="text-white font-medium">
                                                                {new Date(doc.renewalDate).toLocaleDateString()}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`text-2xl font-bold ${daysUntil < 0 ? 'text-red-400' :
                                                        daysUntil <= doc.noticePeriodDays ? 'text-orange-400' :
                                                            'text-slate-300'
                                                        }`}>
                                                        {Math.abs(daysUntil)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {language === 'es' ? 'días' : 'days'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Timeline View */}
                    {viewMode === 'timeline' && !isLoading && filteredDocuments.length > 0 && (
                        <div className="relative">
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-purple-500" />

                            <div className="space-y-8">
                                {filteredDocuments.map((doc, index) => {
                                    const status = getDocumentStatus(doc);
                                    const daysUntil = getDaysUntilRenewal(doc.renewalDate);

                                    return (
                                        <div key={doc.id} className="relative pl-20">
                                            <div className={`absolute left-6 top-6 w-5 h-5 rounded-full border-4 border-slate-900 ${status === 'expired' ? 'bg-red-500' :
                                                status === 'urgent' ? 'bg-orange-500' :
                                                    status === 'upcoming' ? 'bg-yellow-500' :
                                                        'bg-emerald-500'
                                                } animate-pulse`} />

                                            <div
                                                onClick={() => router.push(`/contracts/${doc.id}`)}
                                                className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h3 className="text-lg font-semibold text-white">{doc.fileName}</h3>
                                                    <StatusBadge status={status} />
                                                </div>

                                                <div className="flex items-center gap-6 text-sm text-slate-400">
                                                    <span>{doc.contractType}</span>
                                                    {doc.sector && <span>• {doc.sector}</span>}
                                                    <span>• {language === 'es' ? 'Renueva en' : 'Renews in'} {Math.abs(daysUntil)} {language === 'es' ? 'días' : 'days'}</span>
                                                </div>

                                                <div className="mt-3 text-sm text-slate-500">
                                                    {new Date(doc.renewalDate).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Calendar Grid View */}
                    {viewMode === 'calendar' && !isLoading && (
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                                <button
                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    ←
                                </button>
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedMonth.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', { month: 'long', year: 'numeric' })}
                                </h3>
                                <button
                                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                                    className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    →
                                </button>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 border-b border-slate-700/50">
                                {(language === 'es'
                                    ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
                                    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                                ).map(day => (
                                    <div key={day} className="p-3 text-center text-sm font-medium text-slate-400 border-r border-slate-700/30 last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7">
                                {(() => {
                                    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
                                    const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
                                    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
                                    const daysInMonth = lastDay.getDate();
                                    const cells = [];

                                    // Empty cells for padding
                                    for (let i = 0; i < startPadding; i++) {
                                        cells.push(<div key={`pad-${i}`} className="h-24 border-r border-b border-slate-700/30 bg-slate-900/30" />);
                                    }

                                    // Day cells
                                    for (let day = 1; day <= daysInMonth; day++) {
                                        const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                                        const dateStr = date.toISOString().split('T')[0];
                                        const dayEvents = filteredEvents.filter(e =>
                                            e.date.toISOString().split('T')[0] === dateStr
                                        );
                                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                                        cells.push(
                                            <div
                                                key={day}
                                                className={`h-24 p-1 border-r border-b border-slate-700/30 last:border-r-0 ${isToday ? 'bg-emerald-900/20' : 'hover:bg-slate-700/30'} transition-colors cursor-pointer relative group`}
                                                onClick={() => handleOpenTaskModal(date)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className={`text-xs font-medium ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                        {day}
                                                    </div>
                                                    {/* Add task button - appears on hover */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenTaskModal(date);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/50 transition-all"
                                                        title={language === 'es' ? 'Crear tarea' : 'Create task'}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="space-y-0.5 overflow-y-auto max-h-14 mt-1">
                                                    {dayEvents.slice(0, 3).map((event, idx) => {
                                                        const config = EVENT_TYPE_CONFIG[event.eventType];
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer ${config.color === 'emerald' ? 'bg-emerald-500/30 text-emerald-300' :
                                                                    config.color === 'blue' ? 'bg-blue-500/30 text-blue-300' :
                                                                        config.color === 'red' ? 'bg-red-500/30 text-red-300' :
                                                                            config.color === 'orange' ? 'bg-orange-500/30 text-orange-300' :
                                                                                config.color === 'amber' ? 'bg-amber-500/30 text-amber-300' :
                                                                                    'bg-slate-500/30 text-slate-300'
                                                                    }`}
                                                                title={`${config.icon} ${event.title}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/contracts/${event.documentId}`);
                                                                }}
                                                            >
                                                                {config.icon} {event.fileName.substring(0, 15)}...
                                                            </div>
                                                        );
                                                    })}
                                                    {dayEvents.length > 3 && (
                                                        <div className="text-[10px] text-slate-500 text-center">
                                                            +{dayEvents.length - 3} {language === 'es' ? 'más' : 'more'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return cells;
                                })()}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Task Creation Modal */}
            {showTaskModal && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowTaskModal(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-400" />
                                    {language === 'es' ? 'Nueva Tarea' : 'New Task'}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {selectedDate.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    {language === 'es' ? 'Título *' : 'Title *'}
                                </label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={language === 'es' ? 'Nombre de la tarea...' : 'Task name...'}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    {language === 'es' ? 'Descripción' : 'Description'}
                                </label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder={language === 'es' ? 'Detalles adicionales...' : 'Additional details...'}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                />
                            </div>

                            {/* Event Type */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    {language === 'es' ? 'Tipo de evento' : 'Event Type'}
                                </label>
                                <select
                                    value={newTask.eventType}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, eventType: e.target.value as CalendarEvent['eventType'] }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.icon} {language === 'es' ? config.labelEs : config.labelEn}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assign to Team Member */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-emerald-400" />
                                    {language === 'es' ? 'Asignar a' : 'Assign to'}
                                    {teamMembers.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowTeamModal(true)}
                                            className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                                        >
                                            {language === 'es' ? '+ Añadir miembros' : '+ Add members'}
                                        </button>
                                    )}
                                </label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                >
                                    <option value="">
                                        {language === 'es' ? '-- Sin asignar --' : '-- Unassigned --'}
                                    </option>
                                    {teamMembers.map((member: TeamMember) => (
                                        <option key={member.id} value={member.id}>
                                            {member.avatar} {member.name}
                                        </option>
                                    ))}
                                </select>
                                {newTask.assignedTo && (
                                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {language === 'es'
                                            ? `Se abrirá Gmail para enviar email a: ${teamMembers.find((m: TeamMember) => m.id === newTask.assignedTo)?.email}`
                                            : `Gmail will open to send email to: ${teamMembers.find((m: TeamMember) => m.id === newTask.assignedTo)?.email}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowTaskModal(false)}
                                className="flex-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600/50 transition-colors"
                            >
                                {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={!newTask.title.trim()}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {language === 'es' ? 'Crear Tarea' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Modal */}
            <TeamMembersModal
                isOpen={showTeamModal}
                onClose={() => setShowTeamModal(false)}
                teamMembers={teamMembers}
                onAddMember={handleAddTeamMember}
                onDeleteMember={handleDeleteTeamMember}
                language={language}
            />
        </div>
    );
}

export default function CalendarPage() {
    return (
        <LanguageProvider defaultLanguage="es">
            <CalendarPageContent />
        </LanguageProvider>
    );
}
