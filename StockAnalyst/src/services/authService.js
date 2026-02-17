import { supabase } from './supabaseClient';

/**
 * Authentication Service
 * Handles all authentication operations using Supabase Auth
 */

// ============================================
// REGISTER
// ============================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.fullName - User full name
 * @param {string} userData.role - User role ('user' or 'educator')
 * @returns {Promise<{user, error}>}
 */
export const registerUser = async ({ email, password, fullName, role = 'user', metadata = {} }) => {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                    ...metadata
                }
            }
        });

        if (authError) throw authError;

        // Note: Profile creation is now handled by a database trigger on 'auth.users' table
        // for better security and reliability, especially when email confirmation is enabled.

        return { user: authData.user, error: null };
    } catch (error) {
        console.error('Registration error:', error);
        return { user: null, error: error.message };
    }
};

/**
 * Register a new educator with certificate
 * @param {Object} educatorData - Educator registration data
 * @param {string} educatorData.email - Educator email
 * @param {string} educatorData.password - Educator password
 * @param {string} educatorData.fullName - Educator full name
 * @param {string} educatorData.certificateNumber - Certificate number
 * @param {string} educatorData.certificateFileUrl - Certificate file URL (optional)
 * @returns {Promise<{user, error}>}
 */
export const registerEducator = async ({
    email,
    password,
    fullName,
    certificateNumber,
    certificateFileUrl = null
}) => {
    try {
        // 1. Register as user with educator role
        const { user, error: regError } = await registerUser({
            email,
            password,
            fullName,
            role: 'educator',
            metadata: {
                certificate_number: certificateNumber,
                certificate_file_url: certificateFileUrl
            }
        });

        if (regError) throw new Error(regError);

        // Note: Educator profile creation is now handled by a database trigger
        // on 'auth.users' table for better security and reliability.

        return { user, error: null };
    } catch (error) {
        console.error('Educator registration error:', error);
        return { user: null, error: error.message };
    }
};

// ============================================
// LOGIN
// ============================================

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{user, session, error}>}
 */
export const loginUser = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get user profile data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

        // Fallback or check if user is banned
        if (userData && userData.is_banned) {
            await logoutUser();
            return { user: null, error: 'Your account has been banned. Please contact support.' };
        }

        const finalUserData = userData || {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email,
            role: data.user.user_metadata?.role || 'user'
        };

        return {
            user: { ...data.user, ...finalUserData },
            session: data.session,
            error: null
        };
    } catch (error) {
        console.error('Login error:', error);
        return { user: null, session: null, error: error.message };
    }
};

// ============================================
// LOGOUT
// ============================================

/**
 * Logout current user
 * @returns {Promise<{error}>}
 */
export const logoutUser = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: error.message };
    }
};

// ============================================
// GET CURRENT USER
// ============================================

/**
 * Get current authenticated user
 * @returns {Promise<{user, error}>}
 */
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return { user: null, error: null };

        // Get user profile data
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (userError) throw userError;

        // Fallback for missing profile
        const finalUserData = userData || {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: user.user_metadata?.role || 'user'
        };

        return { user: { ...user, ...finalUserData }, error: null };
    } catch (error) {
        console.error('Get current user error:', error);
        return { user: null, error: error.message };
    }
};

/**
 * Get current session
 * @returns {Promise<{session, error}>}
 */
export const getCurrentSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        console.error('Get session error:', error);
        return { session: null, error: error.message };
    }
};

// ============================================
// PASSWORD RESET
// ============================================

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 */
export const resetPassword = async (email) => {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Password reset error:', error);
        return { error: error.message };
    }
};

/**
 * Update user password
 * @param {string} newPassword - New password
 * @returns {Promise<{error}>}
 */
export const updatePassword = async (newPassword) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Update password error:', error);
        return { error: error.message };
    }
};

// ============================================
// AUTH STATE LISTENER
// ============================================

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Object} Subscription object with unsubscribe method
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
    const { session } = await getCurrentSession();
    return !!session;
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check ('user', 'educator', 'admin')
 * @returns {Promise<boolean>}
 */
export const hasRole = async (role) => {
    const { user } = await getCurrentUser();
    return user?.role === role;
};

/**
 * Check if educator is verified
 * @returns {Promise<boolean>}
 */
export const isEducatorVerified = async () => {
    try {
        const { user } = await getCurrentUser();
        if (!user || user.role !== 'educator') return false;

        const { data, error } = await supabase
            .from('educator_profiles')
            .select('verification_status')
            .eq('educator_id', user.id)
            .maybeSingle();

        if (error) throw error;
        return data?.verification_status === 'approved';
    } catch (error) {
        console.error('Check educator verification error:', error);
        return false;
    }
};

// ============================================
// OTP AUTHENTICATION
// ============================================

/**
 * Send OTP to email for passwordless login
 * @param {string} email - User email
 * @returns {Promise<{error}>}
 */
export const sendOTP = async (email) => {
    try {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Send OTP error:', error);
        return { error: error.message };
    }
};

/**
 * Verify OTP and login user
 * @param {string} email - User email
 * @param {string} token - OTP token (6 digits)
 * @returns {Promise<{user, session, error}>}
 */
export const verifyOTP = async (email, token) => {
    try {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error) throw error;

        // Check if user profile exists, create if not
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

        if (!existingUser) {
            // Auto-create user profile for OTP login
            const fullName = email.split('@')[0]; // Extract name from email
            await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'user',
                    is_verified: true
                }]);
        }

        // Get updated user profile
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

        const finalUserData = userData || {
            id: data.user.id,
            email: email,
            full_name: email.split('@')[0],
            role: 'user'
        };

        return {
            user: { ...data.user, ...finalUserData },
            session: data.session,
            error: null
        };
    } catch (error) {
        console.error('Verify OTP error:', error);
        return { user: null, session: null, error: error.message };
    }
};

// ============================================
// GOOGLE OAUTH
// ============================================

/**
 * Sign in with Google OAuth
 * @returns {Promise<{error}>}
 */
export const signInWithGoogle = async () => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Google OAuth error:', error);
        return { error: error.message };
    }
};

/**
 * Handle OAuth callback and create user profile if needed
 * This is called automatically by Supabase after OAuth redirect
 * @returns {Promise<{user, error}>}
 */
export const handleOAuthCallback = async () => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return { user: null, error: 'No user found' };

        // Check if user profile exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (!existingUser) {
            // Auto-create user profile for OAuth login
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0],
                    role: 'user',
                    is_verified: true,
                    avatar_url: user.user_metadata?.avatar_url || null
                }]);

            if (insertError) throw insertError;
        }

        // Get updated user profile
        const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const finalUserData = userData || {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
            role: 'user'
        };

        return { user: { ...user, ...finalUserData }, error: null };
    } catch (error) {
        console.error('OAuth callback error:', error);
        return { user: null, error: error.message };
    }
};

export default {
    registerUser,
    registerEducator,
    loginUser,
    logoutUser,
    getCurrentUser,
    getCurrentSession,
    resetPassword,
    updatePassword,
    onAuthStateChange,
    isAuthenticated,
    hasRole,
    isEducatorVerified,
    // OTP
    sendOTP,
    verifyOTP,
    // OAuth
    signInWithGoogle,
    handleOAuthCallback
};
