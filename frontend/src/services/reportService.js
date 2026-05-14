import { pb } from './pocketbase';

/**
 * Report Service (PocketBase Version)
 * Handles reporting of education posts
 */

// ============================================
// CREATE REPORT
// ============================================

/**
 * Report a post
 */
export const reportPost = async (postId, reason) => {
    try {
        if (!pb.authStore.isValid) {
            return { report: null, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        if (!reason || !reason.trim()) {
            return { report: null, error: 'Reason is required' };
        }

        // Check if user already reported this post
        try {
            const existingReport = await pb.collection('post_reports').getFirstListItem(
                `post = "${postId}" && reporter = "${user.id}"`
            );
            if (existingReport) {
                return { report: null, error: 'You have already reported this post' };
            }
        } catch (err) {
            if (err.status !== 404) throw err;
        }

        const data = {
            post: postId,
            reporter: user.id,
            reason: reason.trim(),
            status: 'pending'
        };

        const report = await pb.collection('post_reports').create(data);

        return { report, error: null };
    } catch (err) {
        console.error('Exception in reportPost:', err);
        return { report: null, error: err.message };
    }
};

// ============================================
// READ REPORTS
// ============================================

/**
 * Get all reports (admin only)
 */
export const getReports = async (status = 'pending') => {
    try {
        let filter = '';
        if (status) {
            filter = `status = "${status}"`;
        }

        const reports = await pb.collection('post_reports').getFullList({
            filter: filter,
            sort: '-created',
            expand: 'post,reporter'
        });

        return { reports: reports || [], error: null };
    } catch (err) {
        console.error('Exception in getReports:', err);
        return { reports: [], error: err.message };
    }
};

/**
 * Get reports for a specific post
 */
export const getPostReports = async (postId) => {
    try {
        const reports = await pb.collection('post_reports').getFullList({
            filter: `post = "${postId}"`,
            sort: '-created',
            expand: 'reporter'
        });

        return { reports: reports || [], error: null };
    } catch (err) {
        console.error('Exception in getPostReports:', err);
        return { reports: [], error: err.message };
    }
};

/**
 * Check if user has reported a post
 */
export const hasUserReportedPost = async (postId) => {
    try {
        if (!pb.authStore.isValid) {
            return { hasReported: false, error: null };
        }

        const user = pb.authStore.record;

        const report = await pb.collection('post_reports').getFirstListItem(
            `post = "${postId}" && reporter = "${user.id}"`
        );

        return { hasReported: !!report, error: null };
    } catch (err) {
        if (err.status === 404) return { hasReported: false, error: null };
        console.error('Exception in hasUserReportedPost:', err);
        return { hasReported: false, error: err.message };
    }
};

// ============================================
// UPDATE REPORT (Admin)
// ============================================

/**
 * Review a report (admin only)
 */
export const reviewReport = async (reportId, status, adminNotes = '') => {
    try {
        if (!pb.authStore.isValid) {
            return { report: null, error: 'User not authenticated' };
        }

        const user = pb.authStore.record;

        const report = await pb.collection('post_reports').update(reportId, {
            status,
            admin_notes: adminNotes,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString()
        });

        return { report, error: null };
    } catch (err) {
        console.error('Exception in reviewReport:', err);
        return { report: null, error: err.message };
    }
};
