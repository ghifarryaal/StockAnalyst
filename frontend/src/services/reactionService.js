import { pb } from './pocketbase';

/**
 * Reaction Service (PocketBase Version)
 * Handles like/dislike reactions on education posts
 */

// ============================================
// CREATE/UPDATE REACTION
// ============================================

/**
 * Toggle reaction on a post
 */
export const toggleReaction = async (postId, reactionType) => {
    try {
        if (!pb.authStore.isValid) {
            return { reaction: null, error: 'User not authenticated', action: null };
        }

        const user = pb.authStore.record;

        // Check if user already reacted to this post
        let existingReaction = null;
        try {
            existingReaction = await pb.collection('post_reactions').getFirstListItem(
                `post = "${postId}" && user = "${user.id}"`
            );
        } catch (err) {
            // 404 is fine, means no reaction yet
            if (err.status !== 404) throw err;
        }

        // Case 1: No existing reaction - Create new
        if (!existingReaction) {
            const data = await pb.collection('post_reactions').create({
                post: postId,
                user: user.id,
                reaction_type: reactionType
            });

            return { reaction: data, error: null, action: 'created' };
        }

        // Case 2: Same reaction type - Remove (toggle off)
        if (existingReaction.reaction_type === reactionType) {
            await pb.collection('post_reactions').delete(existingReaction.id);
            return { reaction: null, error: null, action: 'removed' };
        }

        // Case 3: Different reaction type - Update
        const data = await pb.collection('post_reactions').update(existingReaction.id, {
            reaction_type: reactionType
        });

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
 */
export const getUserReaction = async (postId) => {
    try {
        if (!pb.authStore.isValid) {
            return { reaction: null, error: null };
        }

        const user = pb.authStore.record;

        const reaction = await pb.collection('post_reactions').getFirstListItem(
            `post = "${postId}" && user = "${user.id}"`
        );

        return { reaction, error: null };
    } catch (err) {
        if (err.status === 404) return { reaction: null, error: null };
        console.error('Exception in getUserReaction:', err);
        return { reaction: null, error: err.message };
    }
};

/**
 * Get reaction counts for a post
 */
export const getReactionCounts = async (postId) => {
    try {
        const post = await pb.collection('education_posts').getOne(postId, {
            fields: 'likes_count,dislikes_count'
        });

        return {
            likes: post.likes_count || 0,
            dislikes: post.dislikes_count || 0,
            error: null
        };
    } catch (err) {
        console.error('Exception in getReactionCounts:', err);
        return { likes: 0, dislikes: 0, error: err.message };
    }
};
