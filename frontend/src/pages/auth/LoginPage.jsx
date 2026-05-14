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
                const from = location.state?.from || '/';
                navigate(from);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
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
                            disabled={loading}
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


                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-sm text-gray-400">Belum punya akun?</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            to="/register"
                            className="block w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold text-center transition-colors text-white"
                        >
                            Daftar sebagai User
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
