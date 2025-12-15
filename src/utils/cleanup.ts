import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Scans for files in the 'contracts' bucket that do not have a corresponding record in the database.
 * @returns List of orphaned file paths
 */
export async function scanOrphanedFiles(): Promise<string[]> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) throw new Error('Supabase Admin not initialized');

    try {
        // 1. List all files in storage
        // Note: list() limits to 100 by default, we might need a loop for large buckets
        // For now, we'll fetch up to 1000
        const { data: files, error: storageError } = await supabaseAdmin
            .storage
            .from('contracts')
            .list('', { limit: 1000, offset: 0 });

        if (storageError) throw storageError;
        if (!files) return [];

        // 2. Fetch all known file paths from DB
        const { data: dbContracts, error: dbError } = await supabaseAdmin
            .from('contracts')
            .select('file_path');

        if (dbError) throw dbError;

        const knownPaths = new Set(dbContracts?.map(c => c.file_path) || []);

        // 3. Compare
        // 'files' from storage returns objects with 'name', but we need the full path if folders are involved.
        // If files are in root: name is path.
        // If files are in user folders (user_id/filename), list() at root returns folders?
        // Let's assume a flat structure or recursively list.
        // Actually, previous implementation uploads to `${user.id}/${file.name}`.
        // So list('') returns FOLDERS (user IDs), not files directly usually.

        // Recursive Listing Strategy:
        // First get top level folders (User IDs)
        // Then list files in each folder.

        // However, list('', { recursive: true }) exists in newer Supabase/Postgrest versions?
        // JS SDK list() doesn't officially support recursive flag cleanly without a loop usually.

        // Let's try a simpler approach assuming standard folder structure.

        let allStoragePaths: string[] = [];

        // List top level items (should be folders = user_ids, or 'anonymous')
        const { data: rootItems } = await supabaseAdmin.storage.from('contracts').list();

        if (rootItems) {
            for (const item of rootItems) {
                if (item.id === null) {
                    // It's a folder (Supabase storage convention: folders have object_id null often, or checking metadata)
                    // Actually, let's just assume everything at root IS a folder based on our app logic.
                    const userId = item.name;
                    const { data: userFiles } = await supabaseAdmin.storage.from('contracts').list(userId);

                    if (userFiles) {
                        for (const file of userFiles) {
                            allStoragePaths.push(`${userId}/${file.name}`);
                        }
                    }
                } else {
                    // It's a file at root (orphaned by definition if we enforce folders?)
                    // Or maybe 'anonymous' uploads.
                    allStoragePaths.push(item.name);
                }
            }
        }

        const orphaned = allStoragePaths.filter(path => !knownPaths.has(path));
        return orphaned;

    } catch (error) {
        console.error('Error scanning orphaned files:', error);
        throw error;
    }
}

/**
 * Deletes files from storage.
 * @param paths List of file paths to delete
 */
export async function cleanupFiles(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) throw new Error('Supabase Admin not initialized');

    const { error } = await supabaseAdmin
        .storage
        .from('contracts')
        .remove(paths);

    if (error) throw error;
}
