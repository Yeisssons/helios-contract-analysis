
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
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
    console.error('❌ Missing SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function recreateUser() {
    const email = 'invitado@helios.local';
    const password = 'InvitadoHelios2024!';

    console.log(`🗑️ Step 1: Deleting existing user ${email}...`);

    // First, find and delete the user
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('⚠️ Could not list users:', listError.message);
        // Continue anyway - maybe we can still create
    } else {
        const existingUser = users?.find(u => u.email === email);
        if (existingUser) {
            console.log(`   Found user with ID: ${existingUser.id}`);
            const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
            if (deleteError) {
                console.error('⚠️ Could not delete user:', deleteError.message);
            } else {
                console.log('   ✅ User deleted successfully');
            }
        } else {
            console.log('   User not found in list (may not exist or hidden)');
        }
    }

    // Wait a moment
    await new Promise(r => setTimeout(r, 1000));

    console.log(`\n👤 Step 2: Creating user ${email} via Admin API...`);

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'guest' }
    });

    if (createError) {
        console.error('❌ Failed to create user:', createError.message);
        console.error('   Full error:', JSON.stringify(createError, null, 2));
    } else {
        console.log('✅ User created successfully!');
        console.log('   ID:', newUser.user?.id);
        console.log('\n🎉 You can now login with:');
        console.log('   Usuario: invitado');
        console.log('   Contraseña: InvitadoHelios2024!');
    }
}

recreateUser();
