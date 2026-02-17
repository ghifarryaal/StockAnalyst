import { supabase } from './supabaseClient';

/**
 * Education Service
 * Handles all CRUD operations for education posts
 */

// ============================================
// CREATE
// ============================================

/**
 * Create a new education post
 * @param {Object} postData - Post data
 * @param {string} postData.title - Post title
 * @param {string} postData.ticker - Stock ticker
 * @param {string} postData.category - Category (sentiment/news/fundamental/technical)
 * @param {string} postData.content - Post content (max 2500 chars)
 * @param {string[]} postData.referenceLinks - Array of reference URLs
 * @returns {Object} { post, error }
 */
export const createPost = async (postData) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { post: null, error: 'User not authenticated' };
        }

        // Validate content length
        if (postData.content.length > 2500) {
            return { post: null, error: 'Content exceeds 2500 characters limit' };
        }

        const { data, error } = await supabase
            .from('education_posts')
            .insert([
                {
                    educator_id: user.id,
                    title: postData.title,
                    ticker: postData.ticker.toUpperCase(),
                    category: postData.category,
                    content: postData.content,
                    reference_links: postData.referenceLinks || []
                }
            ])
            .select(`
        *,
        educator:users!educator_id (
          id,
          full_name,
          email
        )
      `)
            .single();

        if (error) {
            console.error('Error creating post:', error);
            return { post: null, error: error.message };
        }

        return { post: data, error: null };
    } catch (err) {
        console.error('Exception in createPost:', err);
        return { post: null, error: err.message };
    }
};

// ============================================
// READ
// ============================================

/**
 * Get all education posts (feed)
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category
 * @param {string} options.ticker - Filter by ticker
 * @param {number} options.limit - Number of posts to fetch
 * @param {number} options.offset - Offset for pagination
 * @returns {Object} { posts, error, count }
 */
export const getPosts = async (options = {}) => {
    try {
        const { category, ticker, limit = 20, offset = 0 } = options;

        let query = supabase
            .from('education_posts')
            .select(`
        *,
        educator:users!educator_id (
          id,
          full_name,
          email
        ),
        educator_profile:educator_profiles!educator_id (
          verification_status
        )
      `, { count: 'exact' })
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (category) {
            query = query.eq('category', category);
        }
        if (ticker) {
            query = query.eq('ticker', ticker.toUpperCase());
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return { posts: [], error: error.message, count: 0 };
        }

        return { posts: data || [], error: null, count };
    } catch (err) {
        console.error('Exception in getPosts:', err);
        return { posts: [], error: err.message, count: 0 };
    }
};

/**
 * Get a single post by ID
 * @param {string} postId - Post UUID
 * @returns {Object} { post, error }
 */
export const getPostById = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('education_posts')
            .select(`
        *,
        educator:users!educator_id (
          id,
          full_name,
          email
        ),
        educator_profile:educator_profiles!educator_id (
          verification_status,
          total_likes,
          total_dislikes,
          total_posts
        )
      `)
            .eq('id', postId)
            .eq('is_deleted', false)
            .single();

        if (error) {
            console.error('Error fetching post:', error);
            return { post: null, error: error.message };
        }

        return { post: data, error: null };
    } catch (err) {
        console.error('Exception in getPostById:', err);
        return { post: null, error: err.message };
    }
};

/**
 * Get posts by educator
 * @param {string} educatorId - Educator user ID
 * @returns {Object} { posts, error }
 */
export const getPostsByEducator = async (educatorId) => {
    try {
        const { data, error } = await supabase
            .from('education_posts')
            .select('*')
            .eq('educator_id', educatorId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching educator posts:', error);
            return { posts: [], error: error.message };
        }

        return { posts: data || [], error: null };
    } catch (err) {
        console.error('Exception in getPostsByEducator:', err);
        return { posts: [], error: err.message };
    }
};

// ============================================
// UPDATE
// ============================================

/**
 * Update a post
 * @param {string} postId - Post UUID
 * @param {Object} updates - Fields to update
 * @returns {Object} { post, error }
 */
export const updatePost = async (postId, updates) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { post: null, error: 'User not authenticated' };
        }

        // Validate content length if updating content
        if (updates.content && updates.content.length > 2500) {
            return { post: null, error: 'Content exceeds 2500 characters limit' };
        }

        // Ensure ticker is uppercase if provided
        if (updates.ticker) {
            updates.ticker = updates.ticker.toUpperCase();
        }

        const { data, error } = await supabase
            .from('education_posts')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', postId)
            .eq('educator_id', user.id) // Only allow educator to update their own posts
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            return { post: null, error: error.message };
        }

        return { post: data, error: null };
    } catch (err) {
        console.error('Exception in updatePost:', err);
        return { post: null, error: err.message };
    }
};

// ============================================
// DELETE
// ============================================

/**
 * Soft delete a post (educator)
 * @param {string} postId - Post UUID
 * @returns {Object} { success, error }
 */
export const deletePost = async (postId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('education_posts')
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
                deleted_reason: 'Deleted by educator'
            })
            .eq('id', postId)
            .eq('educator_id', user.id);

        if (error) {
            console.error('Error deleting post:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Exception in deletePost:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Admin delete post
 * @param {string} postId - Post UUID
 * @param {string} reason - Deletion reason
 * @returns {Object} { success, error }
 */
export const adminDeletePost = async (postId, reason) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('education_posts')
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: user.id,
                deleted_reason: reason
            })
            .eq('id', postId);

        if (error) {
            console.error('Error admin deleting post:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err) {
        console.error('Exception in adminDeletePost:', err);
        return { success: false, error: err.message };
    }
};

// ============================================
// SEARCH
// ============================================

/**
 * Search posts by keyword
 * @param {string} keyword - Search keyword
 * @param {number} limit - Number of results
 * @returns {Object} { posts, error }
 */
export const searchPosts = async (keyword, limit = 20) => {
    try {
        const { data, error } = await supabase
            .from('education_posts')
            .select(`
        *,
        educator:users!educator_id (
          id,
          full_name
        )
      `)
            .eq('is_deleted', false)
            .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,ticker.ilike.%${keyword}%`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error searching posts:', error);
            return { posts: [], error: error.message };
        }

        return { posts: data || [], error: null };
    } catch (err) {
        console.error('Exception in searchPosts:', err);
        return { posts: [], error: err.message };
    }
};
