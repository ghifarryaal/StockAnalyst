import { pb } from './pocketbase';

/**
 * Authentication Service (PocketBase Version)
 */

// ============================================
// REGISTER
// ============================================

export const registerUser = async ({ email, password, fullName, role = 'user', metadata = {} }) => {
    try {
        const data = {
            email,
            password,
            passwordConfirm: password,
            full_name: fullName,
            role: role,
            is_verified: false,
            ...metadata
        };

        const user = await pb.collection('users').create(data);
        
        // PocketBase handles email verification sending automatically if configured
        
        return { user, error: null };
    } catch (error) {
        console.error('Registration error:', error);
        return { user: null, error: error.message };
    }
};

export const registerEducator = async ({
    email,
    password,
    fullName,
    certificateNumber,
    certificateFileUrl = null
}) => {
    try {
        const { user, error: regError } = await registerUser({
            email,
            password,
            fullName,
            role: 'educator',
            metadata: {
                certificate_number: certificateNumber,
                certificate_file_url: certificateFileUrl,
                verification_status: 'pending'
            }
        });

        if (regError) throw new Error(regError);

        return { user, error: null };
    } catch (error) {
        console.error('Educator registration error:', error);
        return { user: null, error: error.message };
    }
};

// ============================================
// LOGIN
// ============================================

export const loginUser = async (email, password) => {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);

        // Check if user is banned (assuming is_banned field exists)
        if (authData.record.is_banned) {
            await logoutUser();
            return { user: null, error: 'Your account has been banned. Please contact support.' };
        }

        return {
            user: authData.record,
            session: authData.token,
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

export const logoutUser = async () => {
    try {
        pb.authStore.clear();
        return { error: null };
    } catch (error) {
        console.error('Logout error:', error);
        return { error: error.message };
    }
};

// ============================================
// GET CURRENT USER
// ============================================

export const getCurrentUser = async () => {
    try {
        if (!pb.authStore.isValid) {
            return { user: null, error: null };
        }
        
        const user = pb.authStore.record;
        return { user, error: null };
    } catch (error) {
        console.error('Get current user error:', error);
        return { user: null, error: error.message };
    }
};

export const getCurrentSession = async () => {
    try {
        return { session: pb.authStore.token, error: null };
    } catch (error) {
        return { session: null, error: error.message };
    }
};

// ============================================
// PASSWORD RESET
// ============================================

export const resetPassword = async (email) => {
    try {
        await pb.collection('users').requestPasswordReset(email);
        return { error: null };
    } catch (error) {
        console.error('Password reset error:', error);
        return { error: error.message };
    }
};

export const updatePassword = async (newPassword) => {
    try {
        const user = pb.authStore.record;
        if (!user) throw new Error('Not authenticated');
        
        await pb.collection('users').update(user.id, {
            password: newPassword,
            passwordConfirm: newPassword,
        });
        return { error: null };
    } catch (error) {
        console.error('Update password error:', error);
        return { error: error.message };
    }
};

// ============================================
// AUTH STATE LISTENER
// ============================================

export const onAuthStateChange = (callback) => {
    // PocketBase uses a simple callback for auth store changes
    const unsubscribe = pb.authStore.onChange((token, record) => {
        const event = record ? 'SIGNED_IN' : 'SIGNED_OUT';
        callback(event, record ? { user: record, token } : null);
    }, true);

    return { data: { subscription: { unsubscribe } } };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const isAuthenticated = async () => {
    return pb.authStore.isValid;
};

export const hasRole = async (role) => {
    return pb.authStore.record?.role === role;
};

// ============================================
// OAuth
// ============================================

export const signInWithGoogle = async () => {
    try {
        const authData = await pb.collection('users').authWithOAuth2({ 
            provider: 'google',
            url: window.location.origin
        });
        
        // Update profile with Google metadata if needed
        if (authData.meta && !authData.record.full_name) {
            await pb.collection('users').update(authData.record.id, {
                full_name: authData.meta.name,
                avatar_url: authData.meta.avatarUrl
            });
        }
        
        return { user: authData.record, error: null };
    } catch (error) {
        console.error('Google OAuth error:', error);
        return { error: error.message };
    }
};

export const getEducatorProfile = async (educatorId) => {
    try {
        const profile = await pb.collection('educator_profiles').getFirstListItem(
            `educator = "${educatorId}"`
        );
        return { data: profile, error: null };
    } catch (error) {
        if (error.status === 404) return { data: null, error: null };
        console.error('Error getting educator profile:', error);
        return { data: null, error: error.message };
    }
};

export const sendOTP = async (email) => {
    // PocketBase doesn't have a direct equivalent to Supabase OTP login.
    // We'll use requestPasswordReset as a fallback or return an error.
    try {
        await pb.collection('users').requestPasswordReset(email);
        return { error: null };
    } catch (error) {
        return { error: error.message };
    }
};

export const verifyOTP = async (email, token) => {
    // This is not directly supported in PB without custom backend code.
    return { error: 'OTP login is not supported in PocketBase. Please use email/password or Google login.' };
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
    signInWithGoogle,
    getEducatorProfile,
    sendOTP,
    verifyOTP
};
