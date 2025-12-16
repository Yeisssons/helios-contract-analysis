
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual ENV parser
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars: any = {};
        envFile.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.join('=').trim();
            }
        });
        return envVars;
    } catch (e) {
        console.error('Failed to read .env.local', e);
        return {};
    }
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
    console.error('❌ Missing credentials in .env.local for Guest creation');
    process.exit(1);
}

const supabaseAdmin = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createGuestUser() {
    const email = 'invitado@helios.local';
    const password = 'InvitadoHelios2024!';

    console.log(`👤 Creating Guest User: ${email}`);

    // 1. Check if user exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
        // Fallback or just ignore if table empty or error specific
        console.error('⚠️ Could not list users:', listError.message);
    }

    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
        console.log(`⚠️ User ${email} already exists.`);
        // Reset password just in case
        console.log('🔄 Resetting password to ensure access...');
        const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            { password: password, email_confirm: true, user_metadata: { provider: 'email' } }
        );
        if (resetError) {
            console.error('❌ Failed to reset guest password:', resetError.message);
        } else {
            console.log('✅ Guest password reset successfully.');
        }
    } else {
        // Create new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { provider: 'email' }
        });

        if (createError) {
            console.error('❌ Failed to create guest user:', createError.message);
        } else {
            console.log(`✅ Guest user created! ID: ${newUser.user?.id}`);
        }
    }
}

createGuestUser();
