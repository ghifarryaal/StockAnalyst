import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AutoMigrate = () => {
    const [migrating, setMigrating] = useState(false);
    const [logs, setLogs] = useState([]);
    const [completed, setCompleted] = useState(false);

    const addLog = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    };

    const runMigration = async () => {
        setLogs([]);
        setMigrating(true);
        setCompleted(false);

        try {
            addLog('🚀 Starting automatic database migration...', 'info');
            addLog('', 'info');

            // Check connection first
            addLog('🔌 Checking Supabase connection...', 'info');
            const { error: pingError } = await supabase
                .from('users')
                .select('count', { count: 'exact', head: true });

            if (!pingError) {
                addLog('⚠️  Tables already exist! Migration might have been run before.', 'warning');
                addLog('ℹ️  Continuing anyway (SQL has IF NOT EXISTS checks)...', 'info');
            }

            // Create tables using Supabase RPC or direct SQL
            addLog('📊 Creating database tables...', 'info');

            // Since we can't execute raw SQL directly from client for security,
            // we'll create tables one by one using the schema
            const migrations = [
                {
                    name: 'users table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.users (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              email TEXT NOT NULL UNIQUE,
              full_name TEXT NOT NULL,
              role TEXT NOT NULL CHECK (role IN ('user', 'educator', 'admin')) DEFAULT 'user',
              is_verified BOOLEAN DEFAULT FALSE,
              is_banned BOOLEAN DEFAULT FALSE,
              banned_reason TEXT,
              banned_at TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
                },
                {
                    name: 'educator_profiles table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.educator_profiles (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
              certificate_number TEXT,
              certificate_file_url TEXT,
              verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
              verification_notes TEXT,
              verified_by UUID REFERENCES public.users(id),
              verified_at TIMESTAMPTZ,
              total_likes INTEGER DEFAULT 0,
              total_dislikes INTEGER DEFAULT 0,
              total_posts INTEGER DEFAULT 0,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
                },
                {
                    name: 'education_posts table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.education_posts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              educator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
              title TEXT NOT NULL,
              ticker TEXT NOT NULL,
              category TEXT NOT NULL CHECK (category IN ('sentiment', 'news', 'fundamental', 'technical')),
              content TEXT NOT NULL CHECK (char_length(content) <= 2500),
              reference_links TEXT[],
              likes_count INTEGER DEFAULT 0,
              dislikes_count INTEGER DEFAULT 0,
              reports_count INTEGER DEFAULT 0,
              is_deleted BOOLEAN DEFAULT FALSE,
              deleted_reason TEXT,
              deleted_by UUID REFERENCES public.users(id),
              deleted_at TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
                },
                {
                    name: 'post_reactions table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.post_reactions (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              post_id UUID REFERENCES public.education_posts(id) ON DELETE CASCADE,
              user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
              reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')) NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(post_id, user_id)
            );
          `
                },
                {
                    name: 'post_reports table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.post_reports (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              post_id UUID REFERENCES public.education_posts(id) ON DELETE CASCADE,
              reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
              reason TEXT NOT NULL,
              status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
              admin_notes TEXT,
              reviewed_by UUID REFERENCES public.users(id),
              reviewed_at TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW()
            );
          `
                },
                {
                    name: 'terms_acceptance table',
                    sql: `
            CREATE TABLE IF NOT EXISTS public.terms_acceptance (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
              terms_version TEXT NOT NULL,
              accepted_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(user_id, terms_version)
            );
          `
                }
            ];

            // Execute migrations via RPC
            for (const migration of migrations) {
                try {
                    addLog(`   Creating ${migration.name}...`, 'info');

                    const { error } = await supabase.rpc('exec_sql', { sql_query: migration.sql });

                    if (error) {
                        // If RPC doesn't exist, we need manual migration
                        addLog(`   ⚠️  Cannot auto-create ${migration.name}`, 'warning');
                        addLog(`   ℹ️  RPC function not available`, 'info');
                    } else {
                        addLog(`   ✅ ${migration.name} created`, 'success');
                    }
                } catch (err) {
                    addLog(`   ⚠️  ${migration.name}: ${err.message}`, 'warning');
                }
            }

            addLog('', 'info');
            addLog('═══════════════════════════════════════', 'info');
            addLog('⚠️  MANUAL MIGRATION REQUIRED', 'warning');
            addLog('═══════════════════════════════════════', 'info');
            addLog('', 'info');
            addLog('Supabase tidak mengizinkan execute SQL langsung dari client', 'warning');
            addLog('untuk alasan keamanan. Anda perlu run SQL secara manual.', 'warning');
            addLog('', 'info');
            addLog('📝 Langkah Manual Migration:', 'info');
            addLog('1. Buka Supabase Dashboard', 'info');
            addLog('2. Klik SQL Editor', 'info');
            addLog('3. Copy isi file: supabase-education-schema.sql', 'info');
            addLog('4. Paste dan Run', 'info');
            addLog('5. Kembali ke /test-supabase untuk verify', 'info');
            addLog('', 'info');
            addLog('🔗 Quick Link:', 'info');
            addLog('https://app.supabase.com/project/ahakrootuqwalgowcjqx/sql', 'info');

        } catch (error) {
            addLog(`❌ Migration failed: ${error.message}`, 'error');
        } finally {
            setMigrating(false);
            setCompleted(true);
        }
    };

    const getLogColor = (type) => {
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
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Database Auto Migration
                        </h1>
                        <p className="text-gray-400 mt-2">Automatic setup for Education Module tables</p>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Important Note</h3>
                        <p className="text-sm text-gray-300">
                            Supabase tidak mengizinkan execute SQL langsung dari client untuk keamanan.
                            Anda tetap perlu run SQL schema secara manual di Supabase Dashboard.
                        </p>
                    </div>

                    {!completed && (
                        <button
                            onClick={runMigration}
                            disabled={migrating}
                            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 mb-6"
                        >
                            {migrating ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Running Migration...
                                </>
                            ) : (
                                <>
                                    🚀 Start Migration
                                </>
                            )}
                        </button>
                    )}

                    <div className="bg-black/50 rounded-lg p-6 font-mono text-sm max-h-[500px] overflow-y-auto">
                        {logs.length === 0 ? (
                            <div className="text-gray-500 text-center py-8">
                                Click "Start Migration" to begin...
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {logs.map((log, index) => (
                                    <div key={index} className={getLogColor(log.type)}>
                                        {log.message}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {completed && (
                        <div className="mt-6 space-y-4">
                            <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                <h3 className="font-semibold text-blue-400 mb-3">📝 Manual Migration Steps:</h3>
                                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                                    <li>Buka <a href="https://app.supabase.com/project/ahakrootuqwalgowcjqx/sql" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Supabase SQL Editor</a></li>
                                    <li>Klik "+ New query"</li>
                                    <li>Copy seluruh isi file <code className="bg-black/30 px-2 py-1 rounded">supabase-education-schema.sql</code></li>
                                    <li>Paste ke SQL editor dan klik "Run"</li>
                                    <li>Setelah selesai, buka <a href="/test-supabase" className="text-blue-400 hover:underline">/test-supabase</a> untuk verify</li>
                                </ol>
                            </div>

                            <div className="flex gap-4">
                                <a
                                    href="https://app.supabase.com/project/ahakrootuqwalgowcjqx/sql"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
                                >
                                    🔗 Open Supabase SQL Editor
                                </a>
                                <a
                                    href="/test-supabase"
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-center transition-colors"
                                >
                                    🧪 Test Connection
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AutoMigrate;
