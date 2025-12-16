
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual ENV parser because dotenv is being unreliable in this specific setup
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
const key = env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role to Force Update

if (!url || !key) {
    console.error('❌ Missing credentials in .env.local');
    console.log('URL:', url);
    console.log('Key Present:', !!key);
    process.exit(1);
}

const supabaseAdmin = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function forceResetPassword() {
    const email = 'admin@helios.local';
    const password = 'AdminHelios2024!';

    console.log(`🔧 Force Resetting Password for: ${email}`);

    // 1. Get User ID
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
        console.error('❌ Failed to list users (Check Service Key!):', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('❌ User NOT FOUND in this project.');
        console.error(`Checked project: ${url}`);
        return;
    }

    console.log(`✅ User Found: ${user.id}`);

    // 2. Update Password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        {
            password: password,
            email_confirm: true,
            user_metadata: { provider: 'email' }
        }
    );

    if (updateError) {
        console.error('❌ Password Update Allowed FAILED:', updateError.message);
    } else {
        console.log('🎉 SUCCESS: Password has been force-updated via Admin API.');
        console.log('You should be able to login now.');
    }
}

forceResetPassword();
