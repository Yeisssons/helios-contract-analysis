'use client';

import { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { ContractAnalysis } from './AnalysisResult';
import { Calendar as CalendarIcon, AlertCircle, Clock, FileText, X } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import './calendar-dark.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface CalendarViewProps {
    contracts: ContractAnalysis[];
}

interface DateContract {
    contract: ContractAnalysis;
    type: 'renewal' | 'expiration';
}

export default function CalendarView({ contracts }: CalendarViewProps) {
    const { language } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

    // Create a map of dates to contracts with their type (renewal/expiration)
    const dateContractsMap = useMemo(() => {
        const map = new Map<string, DateContract[]>();

        contracts.forEach(contract => {
            // Add renewal date
            if (contract.renewalDate) {
                const key = contract.renewalDate;
                const existing = map.get(key) || [];
                map.set(key, [...existing, { contract, type: 'renewal' }]);
            }
        });

        return map;
    }, [contracts]);

    // Get status for a date
    const getDateStatus = (date: Date): 'expired' | 'upcoming' | 'future' | null => {
        const dateKey = date.toISOString().split('T')[0];
        const contractsOnDate = dateContractsMap.get(dateKey);

        if (!contractsOnDate || contractsOnDate.length === 0) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const daysUntil = Math.ceil((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) return 'expired';
        if (daysUntil <= 30) return 'upcoming';
        return 'future';
    };

    // Get contracts for selected date
    const selectedDateContracts = useMemo(() => {
        if (!selectedDate) return [];
        const dateKey = selectedDate.toISOString().split('T')[0];
        return dateContractsMap.get(dateKey) || [];
    }, [selectedDate, dateContractsMap]);

    // Custom tile content for calendar - show colored dots
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return null;

        const dateKey = date.toISOString().split('T')[0];
        const contractsOnDate = dateContractsMap.get(dateKey);

        if (!contractsOnDate || contractsOnDate.length === 0) return null;

        const status = getDateStatus(date);

        // Determine dot color based on status
        const colorClass = {
            expired: 'bg-red-500',
            upcoming: 'bg-amber-500',
            future: 'bg-blue-500',
        }[status || 'future'];

        return (
            <div className="flex justify-center gap-1 mt-1">
                {contractsOnDate.slice(0, 3).map((_, index) => (
                    <span key={index} className={`w-1.5 h-1.5 rounded-full ${colorClass}`} />
                ))}
                {contractsOnDate.length > 3 && (
                    <span className="text-[8px] text-slate-400">+{contractsOnDate.length - 3}</span>
                )}
            </div>
        );
    };

    // Custom tile className
    const tileClassName = ({ date, view }: { date: Date; view: string }) => {
        if (view !== 'month') return '';

        const status = getDateStatus(date);
        if (!status) return '';

        const classes = {
            expired: 'calendar-tile-expired',
            upcoming: 'calendar-tile-upcoming',
            future: 'calendar-tile-future',
        };

        return classes[status];
    };

    // Handle date click
    const handleDateClick = (value: Value) => {
        if (value instanceof Date) {
            setSelectedDate(value);
        }
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Calendar Container */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-slate-400">
                            {language === 'es' ? 'Vencido' : 'Expired'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-sm text-slate-400">
                            {language === 'es' ? 'Próximo (30 días)' : 'Upcoming (30 days)'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-slate-400">
                            {language === 'es' ? 'Renovación Futura' : 'Future Renewal'}
                        </span>
                    </div>
                </div>

                {/* Calendar */}
                <div className="calendar-dark-wrapper">
                    <Calendar
                        onChange={handleDateClick}
                        value={selectedDate}
                        activeStartDate={activeStartDate}
                        onActiveStartDateChange={({ activeStartDate: newDate }) => {
                            if (newDate) setActiveStartDate(newDate);
                        }}
                        tileContent={tileContent}
                        tileClassName={tileClassName}
                        locale={language === 'es' ? 'es-ES' : 'en-US'}
                        className="calendar-dark"
                        minDetail="month"
                        next2Label={null}
                        prev2Label={null}
                    />
                </div>
            </div>

            {/* Selected Date Contracts - Day View Card */}
            {selectedDate && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-lg font-semibold text-white">
                                {formatDate(selectedDate.toISOString().split('T')[0])}
                            </h3>
                            {selectedDateContracts.length > 0 && (
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400">
                                    {selectedDateContracts.length} {selectedDateContracts.length === 1
                                        ? (language === 'es' ? 'contrato' : 'contract')
                                        : (language === 'es' ? 'contratos' : 'contracts')}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedDate(null)}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {selectedDateContracts.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateContracts.map((item, index) => {
                                const { contract, type } = item;
                                const status = getDateStatus(selectedDate);
                                const statusColors = {
                                    expired: 'border-red-500/30 bg-red-500/10',
                                    upcoming: 'border-amber-500/30 bg-amber-500/10',
                                    future: 'border-blue-500/30 bg-blue-500/10',
                                };
                                const statusTextColors = {
                                    expired: 'text-red-400',
                                    upcoming: 'text-amber-400',
                                    future: 'text-blue-400',
                                };
                                const typeLabel = type === 'renewal'
                                    ? (language === 'es' ? 'Renovación' : 'Renewal')
                                    : (language === 'es' ? 'Vencimiento' : 'Expiration');

                                return (
                                    <div
                                        key={contract.id || index}
                                        className={`p-4 rounded-xl border ${statusColors[status || 'future']}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <FileText className={`w-5 h-5 mt-0.5 ${statusTextColors[status || 'future']}`} />
                                                <div>
                                                    <h4 className="font-medium text-white">{contract.fileName}</h4>
                                                    <p className="text-sm text-slate-400 mt-1">{contract.contractType}</p>
                                                    {contract.parties && contract.parties.length > 0 && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            {contract.parties.join(' • ')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[status || 'future']} ${statusTextColors[status || 'future']}`}>
                                                    {typeLabel}
                                                </span>
                                                <div className="flex items-center gap-1 mt-2 text-sm text-slate-400">
                                                    <Clock className="w-4 h-4" />
                                                    {contract.noticePeriodDays} {language === 'es' ? 'días aviso' : 'days notice'}
                                                </div>
                                                {status === 'expired' && (
                                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {language === 'es' ? 'Vencido' : 'Expired'}
                                                    </span>
                                                )}
                                                {status === 'upcoming' && (
                                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {language === 'es' ? 'Próximo' : 'Due Soon'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{language === 'es' ? 'No hay contratos en esta fecha' : 'No contracts on this date'}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state when no contracts */}
            {contracts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">{language === 'es' ? 'Sin contratos para mostrar' : 'No contracts to display'}</p>
                    <p className="text-sm mt-2">{language === 'es' ? 'Sube un contrato para ver las fechas de renovación' : 'Upload a contract to see renewal dates'}</p>
                </div>
            )}
        </div>
    );
}
