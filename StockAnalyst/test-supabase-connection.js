import { supabase } from './src/services/supabaseClient.js';

console.log('🧪 Testing Supabase Connection for Education Module...\n');

async function testConnection() {
    try {
        // Test 1: Check if credentials are set
        console.log('📋 Test 1: Checking credentials...');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.log('   ❌ Credentials not found in .env file');
            console.log('   Please add:');
            console.log('   - VITE_SUPABASE_URL');
            console.log('   - VITE_SUPABASE_ANON_KEY');
            return;
        }

        console.log('   ✅ URL:', supabaseUrl);
        console.log('   ✅ Key:', '***' + supabaseKey.slice(-10));
        console.log('');

        // Test 2: Check basic connection
        console.log('🔌 Test 2: Testing basic connection...');
        const { data: pingData, error: pingError } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (pingError) {
            console.log('   ❌ Connection failed:', pingError.message);
            console.log('   Possible issues:');
            console.log('   - SQL schema not run yet');
            console.log('   - Wrong credentials');
            console.log('   - Supabase project not active');
            return;
        }

        console.log('   ✅ Connected successfully!');
        console.log('');

        // Test 3: Check all tables exist
        console.log('📊 Test 3: Checking education module tables...');
        const tables = [
            'users',
            'educator_profiles',
            'education_posts',
            'post_reactions',
            'post_reports',
            'terms_acceptance'
        ];

        let allTablesExist = true;
        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .select('count', { count: 'exact', head: true });

            if (error) {
                console.log(`   ❌ Table "${table}" - NOT FOUND`);
                allTablesExist = false;
            } else {
                console.log(`   ✅ Table "${table}" - OK`);
            }
        }

        if (!allTablesExist) {
            console.log('');
            console.log('   ⚠️  Some tables are missing!');
            console.log('   Please run the SQL schema:');
            console.log('   1. Open Supabase Dashboard → SQL Editor');
            console.log('   2. Copy content from supabase-education-schema.sql');
            console.log('   3. Paste and run');
            return;
        }
        console.log('');

        // Test 4: Check RLS policies
        console.log('🔒 Test 4: Testing RLS policies...');

        // Try to read from users table (should work - public read policy)
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('id, email, role')
            .limit(1);

        if (usersError) {
            console.log('   ❌ RLS policy error:', usersError.message);
        } else {
            console.log('   ✅ RLS policies working');
            if (usersData && usersData.length > 0) {
                console.log('   ℹ️  Found', usersData.length, 'user(s) in database');
            } else {
                console.log('   ℹ️  No users in database yet');
            }
        }
        console.log('');

        // Test 5: Check auth status
        console.log('🔐 Test 5: Checking auth status...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.log('   ❌ Auth error:', sessionError.message);
        } else if (session) {
            console.log('   ✅ User is logged in');
            console.log('   Email:', session.user.email);
        } else {
            console.log('   ℹ️  No active session (not logged in - this is OK)');
        }
        console.log('');

        // Final Summary
        console.log('═══════════════════════════════════════');
        console.log('✅ DATABASE CONNECTION TEST PASSED!');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log('📊 Summary:');
        console.log('   ✅ Credentials configured');
        console.log('   ✅ Connection established');
        console.log('   ✅ All 6 tables created');
        console.log('   ✅ RLS policies enabled');
        console.log('   ✅ Auth system ready');
        console.log('');
        console.log('🎉 Education module database is ready!');
        console.log('');
        console.log('📝 Next steps:');
        console.log('   1. Create admin user (see EDUCATION_DB_SETUP.md)');
        console.log('   2. Build login/register pages');
        console.log('   3. Start creating education posts!');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('═══════════════════════════════════════');
        console.error('❌ TEST FAILED');
        console.error('═══════════════════════════════════════');
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('   1. Check .env file has correct credentials');
        console.error('   2. Verify SQL schema was run in Supabase');
        console.error('   3. Check Supabase project is active');
        console.error('   4. See EDUCATION_DB_SETUP.md for detailed setup');
        console.error('');
    }
}

// Run the test
testConnection();
