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


export default {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getCurrentSession,
    resetPassword,
    updatePassword,
    onAuthStateChange,
    isAuthenticated,
    hasRole
};
