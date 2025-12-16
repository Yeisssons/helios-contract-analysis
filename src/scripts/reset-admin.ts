
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkAndResetAdmin() {
    // Dynamic import to ensure process.env is populated first
    const { supabaseAdmin } = await import('@/lib/supabase');

    const email = 'admin@helios.local';
    const password = 'AdminHelios2024!';

    if (!supabaseAdmin) {
        console.error('❌ Supabase Admin not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env.local');
        // Debug print (masked)
        console.log('DEBUG: URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('DEBUG: KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
        process.exit(1);
    }

    console.log(`🔍 Checking for user: ${email}...`);

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
        process.exit(1);
    }

    const adminUser = users.find(u => u.email === email);

    if (adminUser) {
        console.log(`✅ User found (ID: ${adminUser.id}). Resetting password...`);

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            adminUser.id,
            { password: password, email_confirm: true }
        );

        if (updateError) {
            console.error('❌ Error updating password:', updateError.message);
        } else {
            console.log(`🎉 Password reset successful!`);
            console.log(`User: ${email}`);
            console.log(`Pass: ${password}`);
        }
    } else {
        console.log(`⚠️ User not found. Creating new admin user...`);

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (createError) {
            console.error('❌ Error creating user:', createError.message);
        } else {
            console.log(`🎉 Admin user created! (ID: ${newUser.user?.id})`);
            console.log(`User: ${email}`);
            console.log(`Pass: ${password}`);
        }
    }
}

checkAndResetAdmin();
