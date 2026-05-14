import { pb } from './pocketbase';

/**
 * Education Service (PocketBase Version)
 * Handles all CRUD operations for education posts
 */

// ============================================
// CREATE
// ============================================

/**
 * Create a new education post
 */
export const createPost = async (postData) => {
    try {
        if (!pb.authStore.isValid) {
            return { post: null, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        // Validate content length
        if (postData.content.length > 2500) {
            return { post: null, error: 'Content exceeds 2500 characters limit' };
        }

        const data = {
            educator: user.id,
            title: postData.title,
            ticker: postData.ticker.toUpperCase(),
            category: postData.category,
            content: postData.content,
            reference_links: postData.referenceLinks || []
        };

        const post = await pb.collection('education_posts').create(data, {
            expand: 'educator'
        });

        return { post, error: null };
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
 */
export const getPosts = async (options = {}) => {
    try {
        const { category, ticker, limit = 20, offset = 0 } = options;
        
        const page = Math.floor(offset / limit) + 1;

        let filter = 'is_deleted = false';
        if (category) {
            filter += ` && category = "${category}"`;
        }
        if (ticker) {
            filter += ` && ticker = "${ticker.toUpperCase()}"`;
        }

        const resultList = await pb.collection('education_posts').getList(page, limit, {
            filter: filter,
            sort: '-created',
            expand: 'educator,educator.educator_profiles_via_educator'
        });

        return { 
            posts: resultList.items || [], 
            error: null, 
            count: resultList.totalItems 
        };
    } catch (err) {
        console.error('Exception in getPosts:', err);
        return { posts: [], error: err.message, count: 0 };
    }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId) => {
    try {
        const post = await pb.collection('education_posts').getOne(postId, {
            expand: 'educator,educator.educator_profiles_via_educator'
        });

        if (post.is_deleted) {
            return { post: null, error: 'Post has been deleted' };
        }

        return { post, error: null };
    } catch (err) {
        console.error('Exception in getPostById:', err);
        return { post: null, error: err.message };
    }
};

/**
 * Get posts by educator
 */
export const getPostsByEducator = async (educatorId) => {
    try {
        const posts = await pb.collection('education_posts').getFullList({
            filter: `educator = "${educatorId}" && is_deleted = false`,
            sort: '-created'
        });

        return { posts: posts || [], error: null };
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
 */
export const updatePost = async (postId, updates) => {
    try {
        if (!pb.authStore.isValid) {
            return { post: null, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        // Validate content length if updating content
        if (updates.content && updates.content.length > 2500) {
            return { post: null, error: 'Content exceeds 2500 characters limit' };
        }

        // Ensure ticker is uppercase if provided
        if (updates.ticker) {
            updates.ticker = updates.ticker.toUpperCase();
        }

        const post = await pb.collection('education_posts').update(postId, updates, {
            expand: 'educator'
        });

        return { post, error: null };
    } catch (err) {
        console.error('Exception in updatePost:', err);
        return { post: null, error: err.message };
    }
};

// ============================================
// DELETE
// ============================================

/**
 * Soft delete a post
 */
export const deletePost = async (postId) => {
    try {
        if (!pb.authStore.isValid) {
            return { success: false, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        await pb.collection('education_posts').update(postId, {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            deleted_by: user.id,
            deleted_reason: 'Deleted by educator'
        });

        return { success: true, error: null };
    } catch (err) {
        console.error('Exception in deletePost:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Admin delete post
 */
export const adminDeletePost = async (postId, reason) => {
    try {
        if (!pb.authStore.isValid) {
            return { success: false, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        await pb.collection('education_posts').update(postId, {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            deleted_by: user.id,
            deleted_reason: reason
        });

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
 */
export const searchPosts = async (keyword, limit = 20) => {
    try {
        const posts = await pb.collection('education_posts').getList(1, limit, {
            filter: `is_deleted = false && (title ~ "${keyword}" || content ~ "${keyword}" || ticker ~ "${keyword}")`,
            sort: '-created',
            expand: 'educator'
        });

        return { posts: posts.items || [], error: null };
    } catch (err) {
        console.error('Exception in searchPosts:', err);
        return { posts: [], error: err.message };
    }
};
