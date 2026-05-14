import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, getCurrentSession, onAuthStateChange, logoutUser } from '../services/authService';

// Create Auth Context
const AuthContext = createContext({});

// Hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        loadUser();

        // Subscribe to auth changes
        const { data: authListener } = onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);

            if (session) {
                const { user: userData } = await getCurrentUser();
                setUser(userData);
                setSession(session);
            } else {
                setUser(null);
                setSession(null);
            }

            setLoading(false);
        });

        // Cleanup subscription
        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Load current user
    const loadUser = async () => {
        try {
            const { session: currentSession } = await getCurrentSession();

            if (currentSession) {
                const { user: userData } = await getCurrentUser();
                setUser(userData);
                setSession(currentSession);
            }
        } catch (error) {
            console.error('Error loading user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
            setSession(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Context value
    const value = {
        user,
        session,
        loading,
        isAuthenticated: !!user,
        isEducator: user?.role === 'educator',
        isAdmin: user?.role === 'admin',
        logout,
        refreshUser: loadUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
