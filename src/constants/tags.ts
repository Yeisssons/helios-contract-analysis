export type TagId = 'urgent' | 'reviewed' | 'pending' | 'confidential' | 'hr' | 'supplier' | 'legal';

export interface TagPreset {
    id: TagId;
    labelEs: string;
    labelEn: string;
    color: 'red' | 'green' | 'yellow' | 'purple' | 'blue' | 'orange' | 'gray';
}

export const TAG_PRESETS: TagPreset[] = [
    { id: 'urgent', labelEs: 'Urgente', labelEn: 'Urgent', color: 'red' },
    { id: 'reviewed', labelEs: 'Revisado', labelEn: 'Reviewed', color: 'green' },
    { id: 'pending', labelEs: 'Pendiente', labelEn: 'Pending', color: 'yellow' },
    { id: 'confidential', labelEs: 'Confidencial', labelEn: 'Confidential', color: 'purple' },
    { id: 'hr', labelEs: 'RRHH', labelEn: 'HR', color: 'blue' },
    { id: 'supplier', labelEs: 'Proveedores', labelEn: 'Suppliers', color: 'orange' },
    { id: 'legal', labelEs: 'Legal', labelEn: 'Legal', color: 'gray' }
];

export const TAG_COLOR_CLASSES: Record<TagPreset['color'], { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
    gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' }
};
