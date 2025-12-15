'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { SECTOR_TEMPLATES, SectorTemplate } from '@/constants/sectorTemplates';

// Custom template from database
export interface CustomTemplate {
    id: string;
    user_id: string;
    name: string;
    data_points: string[];
    default_points: string[];
    created_at: string;
}

// Combined sector type for unified handling
export interface UnifiedSector {
    id: string;
    label: string;
    labelEs: string;
    labelEn: string;
    dataPoints: string[];
    defaultPoints: string[];
    isCustom: boolean;
    isSystem: boolean;
}

export function useSectors() {
    const { user } = useAuth();
    const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch custom templates
    const fetchTemplates = useCallback(async () => {
        if (!user) {
            setCustomTemplates([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('sector_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setCustomTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError('Error al cargar plantillas');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch
    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // Create template
    const createTemplate = async (
        name: string,
        dataPoints: string[],
        defaultPoints: string[]
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'No autenticado' };

        try {
            const { error: insertError } = await supabase
                .from('sector_templates')
                .insert({
                    user_id: user.id,
                    name,
                    data_points: dataPoints,
                    default_points: defaultPoints,
                });

            if (insertError) throw insertError;
            await fetchTemplates();
            return { success: true };
        } catch (err: any) {
            console.error('Error creating template:', err);
            return { success: false, error: err.message || 'Error al crear plantilla' };
        }
    };

    // Update template
    const updateTemplate = async (
        id: string,
        updates: { name?: string; dataPoints?: string[]; defaultPoints?: string[] }
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'No autenticado' };

        try {
            const updateData: any = {};
            if (updates.name) updateData.name = updates.name;
            if (updates.dataPoints) updateData.data_points = updates.dataPoints;
            if (updates.defaultPoints) updateData.default_points = updates.defaultPoints;

            const { error: updateError } = await supabase
                .from('sector_templates')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id);

            if (updateError) throw updateError;
            await fetchTemplates();
            return { success: true };
        } catch (err: any) {
            console.error('Error updating template:', err);
            return { success: false, error: err.message || 'Error al actualizar plantilla' };
        }
    };

    // Delete template
    const deleteTemplate = async (id: string): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'No autenticado' };

        try {
            const { error: deleteError } = await supabase
                .from('sector_templates')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;
            await fetchTemplates();
            return { success: true };
        } catch (err: any) {
            console.error('Error deleting template:', err);
            return { success: false, error: err.message || 'Error al eliminar plantilla' };
        }
    };

    // Get unified list of sectors (system + custom)
    const getUnifiedSectors = useCallback((): UnifiedSector[] => {
        // System sectors
        const systemSectors: UnifiedSector[] = Object.entries(SECTOR_TEMPLATES).map(([id, template]) => ({
            id,
            label: template.nameEs,
            labelEs: template.nameEs,
            labelEn: template.nameEn,
            dataPoints: template.dataPoints,
            defaultPoints: template.defaultPoints,
            isCustom: false,
            isSystem: true,
        }));

        // Custom sectors
        const customSectors: UnifiedSector[] = customTemplates.map((template) => ({
            id: `custom_${template.id}`,
            label: `${template.name} (Personal)`,
            labelEs: `${template.name} (Personal)`,
            labelEn: `${template.name} (Personal)`,
            dataPoints: template.data_points,
            defaultPoints: template.default_points,
            isCustom: true,
            isSystem: false,
        }));

        return [...systemSectors, ...customSectors];
    }, [customTemplates]);

    // Get sector by ID
    const getSectorById = useCallback((id: string): UnifiedSector | undefined => {
        return getUnifiedSectors().find((s) => s.id === id);
    }, [getUnifiedSectors]);

    return {
        customTemplates,
        loading,
        error,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        fetchTemplates,
        getUnifiedSectors,
        getSectorById,
    };
}
