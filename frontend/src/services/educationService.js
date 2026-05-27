import pb from './pocketbase';

/**
 * Education Service
 * Handles all CRUD operations for education posts using PocketBase
 */

// ============================================
// CREATE
// ============================================

/**
 * Create a new education post
 * @param {Object} postData - Post data
 * @returns {Object} { post, error }
 */
export const createPost = async (postData) => {
    try {
        if (!pb.authStore.isValid) {
            return { post: null, error: 'User not authenticated' };
        }

        const data = {
            educator_id: pb.authStore.model.id,
            title: postData.title,
            ticker: postData.ticker.toUpperCase(),
            category: postData.category,
            content: postData.content,
            reference_links: JSON.stringify(postData.referenceLinks || []),
            is_deleted: false
        };

        const record = await pb.collection('education_posts').create(data, {
            expand: 'educator_id'
        });

        return { post: record, error: null };
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
 * @returns {Object} { posts, error, count }
 */
export const getPosts = async (options = {}) => {
    try {
        const { category, ticker, limit = 20, page = 1 } = options;

        let filters = ['is_deleted = false'];
        
        if (category) {
            filters.push(`category = "${category}"`);
        }
        if (ticker) {
            filters.push(`ticker = "${ticker.toUpperCase()}"`);
        }

        const resultList = await pb.collection('education_posts').getList(page, limit, {
            filter: filters.join(' && '),
            sort: '-created',
            expand: 'educator_id'
        });

        // Map PocketBase record to expected format
        const posts = resultList.items.map(record => ({
            ...record,
            created_at: record.created,
            updated_at: record.updated,
            educator: record.expand?.educator_id || { full_name: 'Unknown Educator' }
        }));

        return { 
            posts: posts, 
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
 * @param {string} postId - Post ID
 * @returns {Object} { post, error }
 */
export const getPostById = async (postId) => {
    try {
        const record = await pb.collection('education_posts').getOne(postId, {
            expand: 'educator_id'
        });

        if (record.is_deleted) {
            return { post: null, error: 'Post not found or deleted' };
        }

        const post = {
            ...record,
            created_at: record.created,
            updated_at: record.updated,
            educator: record.expand?.educator_id || { full_name: 'Unknown Educator' }
        };

        return { post, error: null };
    } catch (err) {
        console.error('Error fetching post:', err);
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
        const records = await pb.collection('education_posts').getFullList({
            filter: `educator_id = "${educatorId}" && is_deleted = false`,
            sort: '-created'
        });

        return { posts: records, error: null };
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
 * @param {string} postId - Post ID
 * @param {Object} updates - Fields to update
 * @returns {Object} { post, error }
 */
export const updatePost = async (postId, updates) => {
    try {
        if (!pb.authStore.isValid) {
            return { post: null, error: 'User not authenticated' };
        }

        // Ensure ticker is uppercase if provided
        if (updates.ticker) {
            updates.ticker = updates.ticker.toUpperCase();
        }

        const record = await pb.collection('education_posts').update(postId, updates);

        return { post: record, error: null };
    } catch (err) {
        console.error('Error updating post:', err);
        return { post: null, error: err.message };
    }
};

// ============================================
// DELETE
// ============================================

/**
 * Soft delete a post
 * @param {string} postId - Post ID
 * @returns {Object} { success, error }
 */
export const deletePost = async (postId) => {
    try {
        if (!pb.authStore.isValid) {
            return { success: false, error: 'User not authenticated' };
        }

        await pb.collection('education_posts').update(postId, {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            deleted_by: pb.authStore.model.id,
            deleted_reason: 'Deleted by educator'
        });

        return { success: true, error: null };
    } catch (err) {
        console.error('Error deleting post:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Delete a post as administrator
 * @param {string} postId - Post ID
 * @param {string} reason - Deletion reason
 * @returns {Object} { success, error }
 */
export const adminDeletePost = async (postId, reason = 'Deleted by admin') => {
    try {
        if (!pb.authStore.isValid) {
            return { success: false, error: 'User not authenticated' };
        }

        await pb.collection('education_posts').update(postId, {
            is_deleted: true,
            deleted_at: new Date().toISOString(),
            deleted_by: pb.authStore.model.id,
            deleted_reason: reason
        });

        return { success: true, error: null };
    } catch (err) {
        console.error('Error admin deleting post:', err);
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
        const resultList = await pb.collection('education_posts').getList(1, limit, {
            filter: `is_deleted = false && (title ~ "${keyword}" || content ~ "${keyword}" || ticker ~ "${keyword}")`,
            sort: '-created',
            expand: 'educator_id'
        });

        const posts = resultList.items.map(record => ({
            ...record,
            created_at: record.created,
            updated_at: record.updated,
            educator: record.expand?.educator_id || { full_name: 'Unknown Educator' }
        }));

        return { posts: posts, error: null };
    } catch (err) {
        console.error('Exception in searchPosts:', err);
        return { posts: [], error: err.message };
    }
};
