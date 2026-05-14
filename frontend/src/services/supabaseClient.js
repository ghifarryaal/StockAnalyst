// import { createClient } from '@supabase/supabase-js';
 
 // Mock Supabase client to prevent crashes while migrating
 export const supabase = {
     auth: {
         getSession: () => Promise.resolve({ data: { session: null }, error: null }),
         onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
     },
     from: () => ({
         select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
     })
 };
 
 export default supabase;
