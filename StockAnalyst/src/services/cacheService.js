import { createClient } from '@supabase/supabase-js';

// ============================================
// Supabase Client Setup
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const cacheTTLHours = parseInt(import.meta.env.VITE_CACHE_TTL_HOURS || '6', 10);

// Validasi environment variables
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

let supabase = null;
if (isSupabaseConfigured) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase cache service initialized');
} else {
    console.log('ℹ️ Supabase not configured, caching disabled (optional feature)');
}

// ============================================
// Cache Service Functions
// ============================================

/**
 * Get cached analysis for a ticker
 * @param {string} ticker - Stock ticker symbol (e.g., 'BBCA')
 * @returns {Promise<{data: string, timestamp: Date} | null>}
 */
export async function getCachedAnalysis(ticker) {
    if (!supabase) {
        console.log('Cache disabled, skipping cache check');
        return null;
    }

    try {
        const upperTicker = ticker.toUpperCase();
        console.log(`🔍 Checking cache for ${upperTicker}...`);

        const { data, error } = await supabase
            .from('stock_analysis_cache')
            .select('analysis_text, created_at, expires_at')
            .eq('ticker', upperTicker)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found - cache miss
                console.log(`❌ Cache miss for ${upperTicker}`);
                return null;
            }
            throw error;
        }

        if (data) {
            const age = Math.round((Date.now() - new Date(data.created_at)) / 1000 / 60);
            console.log(`✅ Cache hit for ${upperTicker} (${age} minutes old)`);

            return {
                data: data.analysis_text,
                timestamp: new Date(data.created_at),
                expiresAt: new Date(data.expires_at)
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting cache:', error);
        // Fallback gracefully - return null to fetch fresh data
        return null;
    }
}

/**
 * Save analysis to cache
 * @param {string} ticker - Stock ticker symbol
 * @param {string} analysisText - Analysis result from AI
 * @returns {Promise<boolean>} - Success status
 */
export async function saveAnalysisToCache(ticker, analysisText) {
    if (!supabase) {
        console.log('Cache disabled, skipping save');
        return false;
    }

    try {
        const upperTicker = ticker.toUpperCase();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + cacheTTLHours);

        console.log(`💾 Saving cache for ${upperTicker} (TTL: ${cacheTTLHours}h)...`);

        const { error } = await supabase
            .from('stock_analysis_cache')
            .insert({
                ticker: upperTicker,
                analysis_text: analysisText,
                expires_at: expiresAt.toISOString()
            });

        if (error) throw error;

        console.log(`✅ Cache saved for ${upperTicker}`);
        return true;
    } catch (error) {
        console.error('Error saving cache:', error);
        // Non-blocking error - app continues to work
        return false;
    }
}

/**
 * Check if cache is valid (not expired)
 * @param {Date} timestamp - Cache timestamp
 * @param {number} ttlHours - Time to live in hours
 * @returns {boolean}
 */
export function isCacheValid(timestamp, ttlHours = cacheTTLHours) {
    if (!timestamp) return false;

    const now = Date.now();
    const cacheTime = new Date(timestamp).getTime();
    const ttlMs = ttlHours * 60 * 60 * 1000;

    return (now - cacheTime) < ttlMs;
}

/**
 * Manually invalidate cache for a ticker
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<boolean>}
 */
export async function invalidateCache(ticker) {
    if (!supabase) return false;

    try {
        const upperTicker = ticker.toUpperCase();
        console.log(`🗑️ Invalidating cache for ${upperTicker}...`);

        const { error } = await supabase
            .from('stock_analysis_cache')
            .delete()
            .eq('ticker', upperTicker);

        if (error) throw error;

        console.log(`✅ Cache invalidated for ${upperTicker}`);
        return true;
    } catch (error) {
        console.error('Error invalidating cache:', error);
        return false;
    }
}

/**
 * Get cache statistics
 * @returns {Promise<{totalEntries: number, validEntries: number}>}
 */
export async function getCacheStats() {
    if (!supabase) return { totalEntries: 0, validEntries: 0 };

    try {
        const { count: totalCount } = await supabase
            .from('stock_analysis_cache')
            .select('*', { count: 'exact', head: true });

        const { count: validCount } = await supabase
            .from('stock_analysis_cache')
            .select('*', { count: 'exact', head: true })
            .gt('expires_at', new Date().toISOString());

        return {
            totalEntries: totalCount || 0,
            validEntries: validCount || 0
        };
    } catch (error) {
        console.error('Error getting cache stats:', error);
        return { totalEntries: 0, validEntries: 0 };
    }
}

/**
 * Check if Supabase is configured and available
 * @returns {boolean}
 */
export function isCacheAvailable() {
    return isSupabaseConfigured && supabase !== null;
}

// Export cache TTL for reference
export { cacheTTLHours };
