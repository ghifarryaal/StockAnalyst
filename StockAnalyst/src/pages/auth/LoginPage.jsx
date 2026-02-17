import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { loginUser, signInWithGoogle } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const location = useLocation();
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { user, error: loginError } = await loginUser(formData.email, formData.password);

            if (loginError) {
                setError(loginError);
                setLoading(false);
                return;
            }

            // Refresh auth context
            await refreshUser();

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/dashboard/admin');
            } else if (user.role === 'educator') {
                navigate('/dashboard/educator');
            } else {
                navigate('/education');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);

        const { error: googleError } = await signInWithGoogle();

        if (googleError) {
            setError(googleError);
            setGoogleLoading(false);
        }
        // If successful, user will be redirected to Google
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        StockAnalyst
                    </h1>
                    <p className="text-gray-400">Platform Edukasi Saham Indonesia</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Login</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading || loading}
                        className="w-full mb-4 py-3 bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 border border-gray-300"
                    >
                        {googleLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menghubungkan...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-sm text-gray-400">atau login dengan email</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Lupa password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* OTP Login Link */}
                    <div className="mt-4 text-center">
                        <Link
                            to="/login/otp"
                            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <KeyRound className="w-4 h-4" />
                            Login dengan OTP (Tanpa Password)
                        </Link>
                    </div>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-sm text-gray-400">Belum punya akun?</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* Register Links */}
                    <div className="space-y-3">
                        <Link
                            to="/register"
                            className="block w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold text-center transition-colors"
                        >
                            Daftar sebagai User
                        </Link>
                        <Link
                            to="/register/educator"
                            className="block w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold text-center transition-all duration-200"
                        >
                            Daftar sebagai Educator
                        </Link>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
