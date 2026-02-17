import { supabase } from './supabaseClient';

/**
 * Report Service
 * Handles reporting of education posts
 */

// ============================================
// CREATE REPORT
// ============================================

/**
 * Report a post
 * @param {string} postId - Post UUID
 * @param {string} reason - Report reason
 * @returns {Object} { report, error }
 */
export const reportPost = async (postId, reason) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { report: null, error: 'User not authenticated' };
        }

        if (!reason || !reason.trim()) {
            return { report: null, error: 'Reason is required' };
        }

        // Check if user already reported this post
        const { data: existingReport } = await supabase
            .from('post_reports')
            .select('id')
            .eq('post_id', postId)
            .eq('reporter_id', user.id)
            .maybeSingle();

        if (existingReport) {
            return { report: null, error: 'You have already reported this post' };
        }

        const { data, error } = await supabase
            .from('post_reports')
            .insert([{
                post_id: postId,
                reporter_id: user.id,
                reason: reason.trim(),
                status: 'pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating report:', error);
            return { report: null, error: error.message };
        }

        return { report: data, error: null };
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
 * @param {string} status - Filter by status (pending/reviewed/dismissed)
 * @returns {Object} { reports, error }
 */
export const getReports = async (status = 'pending') => {
    try {
        let query = supabase
            .from('post_reports')
            .select(`
        *,
        post:education_posts (
          id,
          title,
          ticker,
          category,
          educator_id
        ),
        reporter:users!reporter_id (
          id,
          full_name,
          email
        )
      `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
            return { reports: [], error: error.message };
        }

        return { reports: data || [], error: null };
    } catch (err) {
        console.error('Exception in getReports:', err);
        return { reports: [], error: err.message };
    }
};

/**
 * Get reports for a specific post
 * @param {string} postId - Post UUID
 * @returns {Object} { reports, error }
 */
export const getPostReports = async (postId) => {
    try {
        const { data, error } = await supabase
            .from('post_reports')
            .select(`
        *,
        reporter:users!reporter_id (
          id,
          full_name
        )
      `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching post reports:', error);
            return { reports: [], error: error.message };
        }

        return { reports: data || [], error: null };
    } catch (err) {
        console.error('Exception in getPostReports:', err);
        return { reports: [], error: err.message };
    }
};

/**
 * Check if user has reported a post
 * @param {string} postId - Post UUID
 * @returns {Object} { hasReported, error }
 */
export const hasUserReportedPost = async (postId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { hasReported: false, error: null };
        }

        const { data, error } = await supabase
            .from('post_reports')
            .select('id')
            .eq('post_id', postId)
            .eq('reporter_id', user.id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            console.error('Error checking report status:', error);
            return { hasReported: false, error: error.message };
        }

        return { hasReported: !!data, error: null };
    } catch (err) {
        console.error('Exception in hasUserReportedPost:', err);
        return { hasReported: false, error: err.message };
    }
};

// ============================================
// UPDATE REPORT (Admin)
// ============================================

/**
 * Review a report (admin only)
 * @param {string} reportId - Report UUID
 * @param {string} status - New status (reviewed/dismissed)
 * @param {string} adminNotes - Admin notes
 * @returns {Object} { report, error }
 */
export const reviewReport = async (reportId, status, adminNotes = '') => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { report: null, error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('post_reports')
            .update({
                status,
                admin_notes: adminNotes,
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', reportId)
            .select()
            .single();

        if (error) {
            console.error('Error reviewing report:', error);
            return { report: null, error: error.message };
        }

        return { report: data, error: null };
    } catch (err) {
        console.error('Exception in reviewReport:', err);
        return { report: null, error: err.message };
    }
};
