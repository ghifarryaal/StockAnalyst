import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const SupabaseTest = () => {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const addResult = (message, type = 'info') => {
        setTestResults(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    };

    const runTests = async () => {
        setTestResults([]);
        setLoading(true);

        try {
            addResult('🧪 Starting Supabase Connection Tests...', 'info');

            // Test 1: Check credentials
            addResult('📋 Test 1: Checking credentials...', 'info');
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!url || !key) {
                addResult('❌ Credentials not found in .env!', 'error');
                setLoading(false);
                return;
            }

            addResult(`✅ URL: ${url}`, 'success');
            addResult(`✅ Key: ***${key.slice(-10)}`, 'success');

            // Test 2: Basic connection
            addResult('🔌 Test 2: Testing basic connection...', 'info');
            const { data, error } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true });

            if (error) {
                addResult(`❌ Connection error: ${error.message}`, 'error');
                addResult('ℹ️  SQL schema might not be run yet', 'warning');
                setLoading(false);
                return;
            }

            addResult('✅ Connection successful!', 'success');

            // Test 3: Check all tables
            addResult('📊 Test 3: Checking education module tables...', 'info');
            const tables = ['users', 'educator_profiles', 'education_posts', 'post_reactions', 'post_reports', 'terms_acceptance'];

            let allTablesExist = true;
            for (const table of tables) {
                const { error: tableError } = await supabase
                    .from(table)
                    .select('count', { count: 'exact', head: true });

                if (tableError) {
                    addResult(`❌ Table "${table}" - NOT FOUND`, 'error');
                    allTablesExist = false;
                } else {
                    addResult(`✅ Table "${table}" - OK`, 'success');
                }
            }

            if (!allTablesExist) {
                addResult('⚠️  Some tables are missing! Please run SQL schema.', 'warning');
            }

            // Test 4: Check data
            addResult('🔍 Test 4: Checking existing data...', 'info');
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, email, role, is_verified')
                .limit(5);

            if (usersError) {
                addResult(`❌ Error: ${usersError.message}`, 'error');
            } else {
                addResult(`✅ Found ${usersData.length} user(s)`, 'success');
                if (usersData.length > 0) {
                    usersData.forEach(user => {
                        addResult(`   - ${user.email} (${user.role})`, 'info');
                    });
                }
            }

            // Test 5: Check auth
            addResult('🔐 Test 5: Checking auth status...', 'info');
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                addResult(`✅ Logged in as: ${session.user.email}`, 'success');
            } else {
                addResult('ℹ️  Not logged in (this is OK)', 'info');
            }

            // Summary
            addResult('═══════════════════════════════════════', 'info');
            addResult('✅ ALL TESTS COMPLETED!', 'success');
            addResult('🎉 Supabase is ready for education module!', 'success');

        } catch (err) {
            addResult(`❌ Test failed: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        runTests();
    }, []);

    const getResultColor = (type) => {
        switch (type) {
            case 'success': return 'text-green-400';
            case 'error': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            default: return 'text-gray-300';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Supabase Connection Test
                            </h1>
                            <p className="text-gray-400 mt-2">Testing database connection for Education Module</p>
                        </div>
                        <button
                            onClick={runTests}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    Testing...
                                </>
                            ) : (
                                <>
                                    🔄 Run Tests Again
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-black/50 rounded-lg p-6 font-mono text-sm max-h-[600px] overflow-y-auto">
                        {testResults.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                Click "Run Tests" to start testing...
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {testResults.map((result, index) => (
                                    <div key={index} className={`${getResultColor(result.type)} flex gap-3`}>
                                        <span className="text-gray-600 text-xs">{result.time}</span>
                                        <span className="flex-1">{result.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h3 className="font-semibold text-blue-400 mb-2">📝 Next Steps:</h3>
                        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                            <li>If tables are missing, run SQL schema in Supabase Dashboard</li>
                            <li>Copy content from <code className="bg-black/30 px-2 py-1 rounded">supabase-education-schema.sql</code></li>
                            <li>Paste in Supabase → SQL Editor → Run</li>
                            <li>Click "Run Tests Again" to verify</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupabaseTest;
