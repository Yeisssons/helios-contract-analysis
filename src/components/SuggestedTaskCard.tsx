'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    Calendar,
    Shield,
    FileText,
    Scale,
    Clock,
    CheckCircle,
    Mail,
    ChevronDown,
    Loader2
} from 'lucide-react';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

interface SuggestedTask {
    id: string;
    type: 'high_risk' | 'medium_risk' | 'abusive_clauses' | 'renewal_urgent' | 'renewal_soon' | 'alerts' | 'termination';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    suggestedDate?: Date;
}

interface SuggestedTaskCardProps {
    task: SuggestedTask;
    teamMembers: TeamMember[];
    language: 'es' | 'en';
    contractName: string;
    onTaskAssigned?: (taskId: string, memberId: string) => void;
}

const TASK_ICONS = {
    high_risk: Shield,
    medium_risk: FileText,
    abusive_clauses: Scale,
    renewal_urgent: Clock,
    renewal_soon: Calendar,
    alerts: AlertTriangle,
    termination: FileText
};

const PRIORITY_STYLES = {
    high: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        badge: 'bg-red-500/20 text-red-300'
    },
    medium: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300'
    },
    low: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-300'
    }
};

export default function SuggestedTaskCard({
    task,
    teamMembers,
    language,
    contractName,
    onTaskAssigned
}: SuggestedTaskCardProps) {
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [isAssigning, setIsAssigning] = useState(false);
    const [isAssigned, setIsAssigned] = useState(false);

    const Icon = TASK_ICONS[task.type];
    const styles = PRIORITY_STYLES[task.priority];

    const handleAssign = () => {
        if (!selectedMember) return;

        const member = teamMembers.find(m => m.id === selectedMember);
        if (!member) return;

        setIsAssigning(true);

        // Format date for email
        const taskDate = task.suggestedDate || new Date();
        const formattedDate = taskDate.toLocaleDateString(
            language === 'es' ? 'es-ES' : 'en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        );

        const subject = language === 'es'
            ? `📋 Tarea asignada: ${task.title}`
            : `📋 Task assigned: ${task.title}`;

        const body = language === 'es'
            ? `Hola ${member.name},

Se te ha asignado una nueva tarea relacionada con el documento: "${contractName}"

📋 Tarea: ${task.title}
📝 Descripción: ${task.description}
📅 Fecha sugerida: ${formattedDate}
⚡ Prioridad: ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}

Por favor, revisa el documento y completa esta tarea lo antes posible.

Saludos,
Contract Manager`
            : `Hello ${member.name},

You have been assigned a new task related to the document: "${contractName}"

📋 Task: ${task.title}
📝 Description: ${task.description}
📅 Suggested date: ${formattedDate}
⚡ Priority: ${task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}

Please review the document and complete this task as soon as possible.

Best regards,
Contract Manager`;

        // Open Gmail compose
        const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(member.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');

        // Update states
        setTimeout(() => {
            setIsAssigning(false);
            setIsAssigned(true);
            onTaskAssigned?.(task.id, selectedMember);
        }, 500);
    };

    const priorityLabel = {
        high: language === 'es' ? 'Alta' : 'High',
        medium: language === 'es' ? 'Media' : 'Medium',
        low: language === 'es' ? 'Baja' : 'Low'
    };

    return (
        <div className={`p-4 rounded-xl ${styles.bg} border ${styles.border} transition-all ${isAssigned ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${styles.bg} ${styles.text}`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-medium text-sm truncate">
                            {task.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${styles.badge}`}>
                            {priorityLabel[task.priority]}
                        </span>
                        {isAssigned && (
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                {language === 'es' ? 'Asignada' : 'Assigned'}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                        {task.description}
                    </p>

                    {/* Assignment row */}
                    {!isAssigned && (
                        <div className="flex items-center gap-2">
                            <select
                                value={selectedMember}
                                onChange={(e) => setSelectedMember(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                            >
                                <option value="">
                                    {language === 'es' ? '-- Asignar a --' : '-- Assign to --'}
                                </option>
                                {teamMembers.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.avatar} {member.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={handleAssign}
                                disabled={!selectedMember || isAssigning}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAssigning ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Mail className="w-3 h-3" />
                                )}
                                {language === 'es' ? 'Asignar' : 'Assign'}
                            </button>
                        </div>
                    )}

                    {/* No team members warning */}
                    {teamMembers.length === 0 && !isAssigned && (
                        <p className="text-xs text-amber-400/80 mt-2">
                            {language === 'es'
                                ? '⚠️ Añade miembros del equipo en el Calendario para asignar tareas'
                                : '⚠️ Add team members in Calendar to assign tasks'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Generate suggested tasks based on contract analysis
 */
export function generateSuggestedTasks(
    analysis: {
        riskScore?: number;
        abusiveClauses?: any[];
        alerts?: any[];
        renewalDate?: string;
        terminationClauseReference?: string;
    },
    language: 'es' | 'en'
): SuggestedTask[] {
    const tasks: SuggestedTask[] = [];
    const today = new Date();

    // 1. High Risk
    if (analysis.riskScore && analysis.riskScore >= 7) {
        tasks.push({
            id: 'task-high-risk',
            type: 'high_risk',
            title: language === 'es' ? 'Revisar documento - Riesgo Alto' : 'Review document - High Risk',
            description: language === 'es'
                ? `Puntuación de riesgo: ${analysis.riskScore}/10. Se requiere revisión exhaustiva.`
                : `Risk score: ${analysis.riskScore}/10. Thorough review required.`,
            priority: 'high',
            suggestedDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days
        });
    }

    // 2. Medium Risk
    if (analysis.riskScore && analysis.riskScore >= 4 && analysis.riskScore < 7) {
        tasks.push({
            id: 'task-medium-risk',
            type: 'medium_risk',
            title: language === 'es' ? 'Evaluar términos del contrato' : 'Evaluate contract terms',
            description: language === 'es'
                ? `Puntuación de riesgo: ${analysis.riskScore}/10. Revisar condiciones principales.`
                : `Risk score: ${analysis.riskScore}/10. Review main conditions.`,
            priority: 'medium',
            suggestedDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
    }

    // 3. Abusive Clauses
    if (analysis.abusiveClauses && analysis.abusiveClauses.length > 0) {
        tasks.push({
            id: 'task-abusive-clauses',
            type: 'abusive_clauses',
            title: language === 'es' ? 'Revisión legal urgente - Cláusulas abusivas' : 'Urgent legal review - Abusive clauses',
            description: language === 'es'
                ? `Se detectaron ${analysis.abusiveClauses.length} cláusula(s) potencialmente abusiva(s).`
                : `${analysis.abusiveClauses.length} potentially abusive clause(s) detected.`,
            priority: 'high',
            suggestedDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days
        });
    }

    // 4. Renewal dates
    if (analysis.renewalDate) {
        const renewalDate = new Date(analysis.renewalDate);
        const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilRenewal > 0 && daysUntilRenewal <= 30) {
            tasks.push({
                id: 'task-renewal-urgent',
                type: 'renewal_urgent',
                title: language === 'es' ? 'URGENTE: Gestionar renovación' : 'URGENT: Manage renewal',
                description: language === 'es'
                    ? `El contrato vence en ${daysUntilRenewal} días. Acción inmediata requerida.`
                    : `Contract expires in ${daysUntilRenewal} days. Immediate action required.`,
                priority: 'high',
                suggestedDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000) // Tomorrow
            });
        } else if (daysUntilRenewal > 30 && daysUntilRenewal <= 60) {
            tasks.push({
                id: 'task-renewal-soon',
                type: 'renewal_soon',
                title: language === 'es' ? 'Preparar renovación de contrato' : 'Prepare contract renewal',
                description: language === 'es'
                    ? `El contrato vence en ${daysUntilRenewal} días. Iniciar preparativos.`
                    : `Contract expires in ${daysUntilRenewal} days. Start preparations.`,
                priority: 'medium',
                suggestedDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
            });
        }
    }

    // 5. Multiple Alerts
    if (analysis.alerts && analysis.alerts.length >= 2) {
        tasks.push({
            id: 'task-alerts',
            type: 'alerts',
            title: language === 'es' ? 'Revisar alertas del contrato' : 'Review contract alerts',
            description: language === 'es'
                ? `Hay ${analysis.alerts.length} alertas que requieren atención.`
                : `There are ${analysis.alerts.length} alerts that need attention.`,
            priority: 'medium',
            suggestedDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days
        });
    }

    // 6. Termination Clause
    if (analysis.terminationClauseReference) {
        tasks.push({
            id: 'task-termination',
            type: 'termination',
            title: language === 'es' ? 'Revisar condiciones de terminación' : 'Review termination conditions',
            description: language === 'es'
                ? `Cláusula: ${analysis.terminationClauseReference}. Verificar implicaciones.`
                : `Clause: ${analysis.terminationClauseReference}. Verify implications.`,
            priority: 'low',
            suggestedDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
        });
    }

    return tasks;
}
