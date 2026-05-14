import { pb } from './pocketbase';

/**
 * AI Usage Service (PocketBase Version)
 * Handles rate limiting for AI prompts (5 per day)
 */

/**
 * Get current user's AI usage for today
 */
export const getTodayUsage = async () => {
    try {
        if (!pb.authStore.isValid) return { count: 0, error: 'Not authenticated' };
        
        const user = pb.authStore.record;
        const today = new Date().toISOString().split('T')[0];

        try {
            const result = await pb.collection('ai_usage').getFirstListItem(
                `user = "${user.id}" && usage_date = "${today}"`
            );
            return { count: result.prompt_count || 0, error: null };
        } catch (err) {
            if (err.status === 404) return { count: 0, error: null };
            throw err;
        }
    } catch (error) {
        console.error('Error getting AI usage:', error);
        return { count: 0, error: error.message };
    }
};

/**
 * Increment AI usage count for today
 */
export const incrementUsage = async () => {
    try {
        if (!pb.authStore.isValid) return { success: false, error: 'Not authenticated' };

        const user = pb.authStore.record;
        const today = new Date().toISOString().split('T')[0];

        let existingRecord = null;
        try {
            existingRecord = await pb.collection('ai_usage').getFirstListItem(
                `user = "${user.id}" && usage_date = "${today}"`
            );
        } catch (err) {
            if (err.status !== 404) throw err;
        }

        if (existingRecord) {
            // Update
            await pb.collection('ai_usage').update(existingRecord.id, {
                prompt_count: existingRecord.prompt_count + 1,
                last_prompt_at: new Date().toISOString()
            });
        } else {
            // Insert
            await pb.collection('ai_usage').create({
                user: user.id,
                usage_date: today,
                prompt_count: 1,
                last_prompt_at: new Date().toISOString()
            });
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error incrementing AI usage:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if user can perform an AI prompt
 */
export const checkUsageLimit = async () => {
    const LIMIT = 5;
    const { count, error } = await getTodayUsage();

    if (error) return { allowed: false, remaining: 0, error };

    return {
        allowed: count < LIMIT,
        remaining: Math.max(0, LIMIT - count),
        count,
        error: null
    };
};
