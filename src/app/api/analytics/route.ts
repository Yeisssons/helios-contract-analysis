import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { global: { headers: { Authorization: authHeader } } }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all user contracts
        const { data: contracts, error: contractsError } = await supabase
            .from('contracts')
            .select('id, sector, created_at, risk_score')
            .eq('user_id', user.id);

        if (contractsError) {
            console.error('Error fetching contracts:', contractsError);
        }

        // Fetch all user tasks (from owned teams)
        const { data: tasks, error: tasksError } = await supabase
            .from('tasks')
            .select('id, status, priority, created_at, updated_at')
            .eq('created_by', user.id);

        if (tasksError && tasksError.code !== 'PGRST205') {
            console.error('Error fetching tasks:', tasksError);
        }

        const contractsList = contracts || [];
        const tasksList = tasks || [];

        // Calculate metrics
        const totalDocuments = contractsList.length;
        const totalTasks = tasksList.length;
        const completedTasks = tasksList.filter(t => t.status === 'completed').length;
        const pendingTasks = tasksList.filter(t => t.status === 'pending').length;
        const inProgressTasks = tasksList.filter(t => t.status === 'in_progress').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const tasksPerDocument = totalDocuments > 0 ? Math.round((totalTasks / totalDocuments) * 10) / 10 : 0;

        // Weekly activity (last 7 days)
        const weeklyActivity = [];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = dayNames[date.getDay()];

            const completed = tasksList.filter(t =>
                t.status === 'completed' &&
                t.updated_at &&
                t.updated_at.startsWith(dateStr)
            ).length;

            const created = tasksList.filter(t =>
                t.created_at &&
                t.created_at.startsWith(dateStr)
            ).length;

            weeklyActivity.push({
                day: dayName,
                date: dateStr,
                completed,
                created,
            });
        }

        // Documents by sector
        const sectorCounts: Record<string, number> = {};
        contractsList.forEach(c => {
            const sector = c.sector || 'Sin Clasificar';
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        });
        const documentsBySector = Object.entries(sectorCounts).map(([sector, count]) => ({
            sector,
            count,
        })).sort((a, b) => b.count - a.count);

        // Tasks by priority
        const priorityCounts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
        tasksList.forEach(t => {
            if (t.priority && priorityCounts[t.priority] !== undefined) {
                priorityCounts[t.priority]++;
            }
        });
        const tasksByPriority = Object.entries(priorityCounts).map(([priority, count]) => ({
            priority,
            count,
        }));

        // Calculate productivity score (0-100)
        let productivityScore = 50; // Base score
        if (totalTasks > 0) {
            productivityScore = Math.min(100, Math.round(
                (completedTasks / totalTasks) * 60 + // 60 points for completion rate
                Math.min(totalDocuments, 10) * 2 + // Up to 20 points for documents
                Math.min(completedTasks, 10) * 2 // Up to 20 points for completed tasks
            ));
        }

        // Generate insights
        const insights = [];

        if (pendingTasks > 0) {
            insights.push({
                type: 'warning',
                title: 'Atención requerida',
                message: `${pendingTasks} tarea${pendingTasks > 1 ? 's' : ''} pendiente${pendingTasks > 1 ? 's' : ''} necesita${pendingTasks > 1 ? 'n' : ''} atención`,
            });
        }

        // Find most productive day
        const maxCompleted = Math.max(...weeklyActivity.map(w => w.completed));
        if (maxCompleted > 0) {
            const mostProductiveDay = weeklyActivity.find(w => w.completed === maxCompleted);
            if (mostProductiveDay) {
                insights.push({
                    type: 'success',
                    title: 'Día más productivo',
                    message: `${mostProductiveDay.day}: ${maxCompleted} tarea${maxCompleted > 1 ? 's' : ''} completada${maxCompleted > 1 ? 's' : ''}`,
                });
            }
        }

        // Average documents per week
        const docsThisWeek = contractsList.filter(c => {
            const created = new Date(c.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return created >= weekAgo;
        }).length;

        if (docsThisWeek > 0) {
            insights.push({
                type: 'info',
                title: 'Actividad de documentos',
                message: `${docsThisWeek} documento${docsThisWeek > 1 ? 's' : ''} procesado${docsThisWeek > 1 ? 's' : ''} esta semana`,
            });
        }

        // Risk analysis
        const highRiskDocs = contractsList.filter(c => c.risk_score && c.risk_score >= 70).length;
        if (highRiskDocs > 0) {
            insights.push({
                type: 'danger',
                title: 'Documentos de alto riesgo',
                message: `${highRiskDocs} documento${highRiskDocs > 1 ? 's' : ''} con puntuación de riesgo alta`,
            });
        }

        return NextResponse.json({
            totalDocuments,
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            completionRate,
            tasksPerDocument,
            productivityScore,
            weeklyActivity,
            documentsBySector,
            tasksByPriority,
            insights,
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
