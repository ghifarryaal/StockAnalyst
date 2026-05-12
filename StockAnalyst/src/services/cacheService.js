import { pb } from './pocketbase';

// ============================================
// Configuration
// ============================================

const cacheTTLHours = parseInt(import.meta.env.VITE_CACHE_TTL_HOURS || '6', 10);

// ============================================
// Cache Service Functions
// ============================================

/**
 * Get cached analysis for a ticker
 * @param {string} ticker - Stock ticker symbol (e.g., 'BBCA')
 * @returns {Promise<{data: string, timestamp: Date} | null>}
 */
export async function getCachedAnalysis(ticker) {
    try {
        const upperTicker = ticker.toUpperCase();
        console.log(`🔍 Checking PocketBase cache for ${upperTicker}...`);

        const result = await pb.collection('stock_analysis_cache').getFirstListItem(
            `ticker="${upperTicker}" && expires_at > "${new Date().toISOString()}"`,
            { sort: '-created' }
        );

        if (result) {
            const age = Math.round((Date.now() - new Date(result.created)) / 1000 / 60);
            console.log(`✅ Cache hit for ${upperTicker} (${age} minutes old)`);

            return {
                data: result.analysis_text,
                timestamp: new Date(result.created),
                expiresAt: new Date(result.expires_at)
            };
        }

        return null;
    } catch (error) {
        if (error.status === 404) {
            console.log(`❌ Cache miss for ${ticker.toUpperCase()}`);
        } else {
            console.error('Error getting cache:', error);
        }
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
    try {
        const upperTicker = ticker.toUpperCase();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + cacheTTLHours);

        console.log(`💾 Saving cache for ${upperTicker} (TTL: ${cacheTTLHours}h)...`);

        await pb.collection('stock_analysis_cache').create({
            ticker: upperTicker,
            analysis_text: analysisText,
            expires_at: expiresAt.toISOString()
        });

        console.log(`✅ Cache saved for ${upperTicker}`);
        return true;
    } catch (error) {
        console.error('Error saving cache:', error);
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
    try {
        const upperTicker = ticker.toUpperCase();
        console.log(`🗑️ Invalidating cache for ${upperTicker}...`);

        // Find all records for this ticker and delete them
        const records = await pb.collection('stock_analysis_cache').getFullList({
            filter: `ticker="${upperTicker}"`
        });

        for (const record of records) {
            await pb.collection('stock_analysis_cache').delete(record.id);
        }

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
    try {
        const totalList = await pb.collection('stock_analysis_cache').getList(1, 1);
        const validList = await pb.collection('stock_analysis_cache').getList(1, 1, {
            filter: `expires_at > "${new Date().toISOString()}"`
        });

        return {
            totalEntries: totalList.totalItems,
            validEntries: validList.totalItems
        };
    } catch (error) {
        console.error('Error getting cache stats:', error);
        return { totalEntries: 0, validEntries: 0 };
    }
}

/**
 * Check if PocketBase cache is available
 * @returns {boolean}
 */
export function isCacheAvailable() {
    return !!pb;
}

// Export cache TTL for reference
export { cacheTTLHours };
