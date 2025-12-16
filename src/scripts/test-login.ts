
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.error('❌ Missing ANON_KEY in .env.local');
    process.exit(1);
}

// Use PUBLIC client (like the browser does)
const supabase = createClient(url, anonKey);

async function testLogin() {
    const email = 'invitado@helios.local';
    const password = 'InvitadoHelios2024!';

    console.log(`🔐 Testing login for: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   URL: ${url}`);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.log('❌ Login FAILED:', error.message);
        console.log('   Status:', error.status);
        console.log('   Full error:', JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Login SUCCESS!');
        console.log('   User ID:', data.user?.id);
        console.log('   Session:', !!data.session);
    }
}

testLogin();
