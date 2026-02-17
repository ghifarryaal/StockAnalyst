import { supabase } from './supabaseClient';

/**
 * Reaction Service
 * Handles like/dislike reactions on education posts
 */

// ============================================
// CREATE/UPDATE REACTION
// ============================================

/**
 * Toggle reaction on a post
 * If user already reacted with same type, remove reaction
 * If user reacted with different type, update to new type
 * If user hasn't reacted, create new reaction
 * 
 * @param {string} postId - Post UUID
 * @param {string} reactionType - 'like' or 'dislike'
 * @returns {Object} { reaction, error, action }
 */
export const toggleReaction = async (postId, reactionType) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { reaction: null, error: 'User not authenticated', action: null };
        }

        // Check if user already reacted to this post
        const { data: existingReaction, error: fetchError } = await supabase
            .from('post_reactions')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Error fetching reaction:', fetchError);
            return { reaction: null, error: fetchError.message, action: null };
        }

        // Case 1: No existing reaction - Create new
        if (!existingReaction) {
            const { data, error } = await supabase
                .from('post_reactions')
                .insert([{
                    post_id: postId,
                    user_id: user.id,
                    reaction_type: reactionType
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating reaction:', error);
                return { reaction: null, error: error.message, action: null };
            }

            return { reaction: data, error: null, action: 'created' };
        }

        // Case 2: Same reaction type - Remove (toggle off)
        if (existingReaction.reaction_type === reactionType) {
            const { error } = await supabase
                .from('post_reactions')
                .delete()
                .eq('id', existingReaction.id);

            if (error) {
                console.error('Error removing reaction:', error);
                return { reaction: null, error: error.message, action: null };
            }

            return { reaction: null, error: null, action: 'removed' };
        }

        // Case 3: Different reaction type - Update
        const { data, error } = await supabase
            .from('post_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating reaction:', error);
            return { reaction: null, error: error.message, action: null };
        }

        return { reaction: data, error: null, action: 'updated' };
    } catch (err) {
        console.error('Exception in toggleReaction:', err);
        return { reaction: null, error: err.message, action: null };
    }
};

// ============================================
// READ REACTIONS
// ============================================

/**
 * Get user's reaction for a post
 * @param {string} postId - Post UUID
 * @returns {Object} { reaction, error }
 */
export const getUserReaction = async (postId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { reaction: null, error: null }; // Not an error, just not logged in
        }

        const { data, error } = await supabase
            .from('post_reactions')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user reaction:', error);
            return { reaction: null, error: error.message };
        }

        return { reaction: data, error: null };
    } catch (err) {
        console.error('Exception in getUserReaction:', err);
        return { reaction: null, error: err.message };
    }
};

/**
 * Get reaction counts for a post
 * @param {string} postId - Post UUID
 * @returns {Object} { likes, dislikes, error }
 */
export const getReactionCounts = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('education_posts')
            .select('likes_count, dislikes_count')
            .eq('id', postId)
            .single();

        if (error) {
            console.error('Error fetching reaction counts:', error);
            return { likes: 0, dislikes: 0, error: error.message };
        }

        return {
            likes: data.likes_count || 0,
            dislikes: data.dislikes_count || 0,
            error: null
        };
    } catch (err) {
        console.error('Exception in getReactionCounts:', err);
        return { likes: 0, dislikes: 0, error: err.message };
    }
};
