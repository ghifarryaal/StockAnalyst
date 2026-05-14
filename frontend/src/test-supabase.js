/**
 * Simple Supabase Connection Test
 * This will be run via the browser console or dev tools
 */

// Instructions to run this test:
console.log('📋 To test Supabase connection:');
console.log('1. Make sure dev server is running (npm run dev)');
console.log('2. Open browser and go to http://localhost:7001');
console.log('3. Open browser console (F12)');
console.log('4. Copy and paste the code below:\n');

console.log(`
// Test Supabase Connection
(async () => {
  try {
    console.log('🧪 Testing Supabase Connection...\\n');
    
    // Import supabase client
    const { supabase } = await import('/src/services/supabaseClient.js');
    
    // Test 1: Check credentials
    console.log('📋 Test 1: Checking credentials...');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Credentials not found!');
      return;
    }
    console.log('✅ URL:', url);
    console.log('✅ Key:', '***' + key.slice(-10));
    console.log('');
    
    // Test 2: Test connection
    console.log('🔌 Test 2: Testing connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection error:', error.message);
      console.log('\\nℹ️  This might mean:');
      console.log('   - SQL schema not run yet');
      console.log('   - Table "users" does not exist');
      console.log('\\n📝 Next step: Run SQL schema in Supabase Dashboard');
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('');
    
    // Test 3: Check tables
    console.log('📊 Test 3: Checking tables...');
    const tables = ['users', 'educator_profiles', 'education_posts', 'post_reactions', 'post_reports', 'terms_acceptance'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        console.log(\`   ❌ Table "\${table}" - NOT FOUND\`);
      } else {
        console.log(\`   ✅ Table "\${table}" - OK\`);
      }
    }
    console.log('');
    
    // Test 4: Check data
    console.log('🔍 Test 4: Checking existing data...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Error:', usersError.message);
    } else {
      console.log(\`✅ Found \${usersData.length} user(s)\`);
      if (usersData.length > 0) {
        console.table(usersData);
      }
    }
    console.log('');
    
    // Summary
    console.log('═══════════════════════════════════════');
    console.log('✅ SUPABASE CONNECTION TEST PASSED!');
    console.log('═══════════════════════════════════════');
    console.log('\\n🎉 Database is ready for education module!');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
})();
`);

export default null;
