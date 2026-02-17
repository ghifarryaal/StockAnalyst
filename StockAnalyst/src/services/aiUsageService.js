import { supabase } from './supabaseClient';

/**
 * AI Usage Service
 * Handles rate limiting for AI prompts (5 per day)
 */

/**
 * Get current user's AI usage for today
 * @returns {Promise<{count: number, error: string|null}>}
 */
export const getTodayUsage = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { count: 0, error: 'Not authenticated' };

        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('ai_usage')
            .select('prompt_count')
            .eq('user_id', user.id)
            .eq('usage_date', today)
            .maybeSingle();

        if (error) throw error;

        return { count: data?.prompt_count || 0, error: null };
    } catch (error) {
        console.error('Error getting AI usage:', error);
        return { count: 0, error: error.message };
    }
};

/**
 * Increment AI usage count for today
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const incrementUsage = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const today = new Date().toISOString().split('T')[0];

        // Try to update existing record
        const { data, error: fetchError } = await supabase
            .from('ai_usage')
            .select('id, prompt_count')
            .eq('user_id', user.id)
            .eq('usage_date', today)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (data) {
            // Update
            const { error: updateError } = await supabase
                .from('ai_usage')
                .update({
                    prompt_count: data.prompt_count + 1,
                    last_prompt_at: new Date().toISOString()
                })
                .eq('id', data.id);

            if (updateError) throw updateError;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('ai_usage')
                .insert({
                    user_id: user.id,
                    usage_date: today,
                    prompt_count: 1,
                    last_prompt_at: new Date().toISOString()
                });

            if (insertError) throw insertError;
        }

        return { success: true, error: null };
    } catch (error) {
        console.error('Error incrementing AI usage:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Check if user can perform an AI prompt
 * @returns {Promise<{allowed: boolean, remaining: number, error: string|null}>}
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
