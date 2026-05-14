import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Protected Route Component
 * Restricts access based on authentication and role
 */
const ProtectedRoute = ({ children, role = null, requireVerified = false }) => {
    const { user, loading, isAuthenticated } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (role && user?.role !== role) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
                    <p className="text-gray-300 mb-6">
                        You don't have permission to access this page.
                        {role === 'educator' && ' Only verified educators can access this page.'}
                        {role === 'admin' && ' Only administrators can access this page.'}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Check if user is banned
    if (user?.is_banned) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Account Banned</h2>
                    <p className="text-gray-300 mb-2">Your account has been suspended.</p>
                    {user.banned_reason && (
                        <p className="text-gray-400 text-sm mb-6">
                            Reason: {user.banned_reason}
                        </p>
                    )}
                    <p className="text-gray-500 text-xs">
                        If you believe this is a mistake, please contact support.
                    </p>
                </div>
            </div>
        );
    }

    // Check educator verification if required
    if (requireVerified && user?.role === 'educator') {
        // This will be checked in the component itself via isEducatorVerified()
        // For now, we'll allow access and show verification status in the dashboard
    }

    // Render children if all checks pass
    return children;
};

export default ProtectedRoute;
