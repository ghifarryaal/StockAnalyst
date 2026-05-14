import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
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

            // Verify if user is actually an admin
            if (user.role !== 'admin') {
                setError('Anda bukan administrator. Silakan login melalui halaman biasa.');
                setLoading(false);
                return;
            }

            // Refresh auth context
            await refreshUser();

            // Store that we are in admin session (optional, but logout logic will use role)
            navigate('/dashboard/admin');
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090A0F] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-red-600/20 rounded-2xl mb-4 border border-red-500/20 shadow-lg shadow-red-500/10">
                        <ShieldCheck className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Admin <span className="text-red-500">Access</span>
                    </h1>
                    <p className="text-gray-500 text-sm">StockAnalyst Central Administration</p>
                </div>

                {/* Login Form */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-6">Administrator Login</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Admin Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                    placeholder="admin@stockanalyst.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                                Secure Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-gray-800 disabled:to-gray-800 rounded-2xl font-bold text-white shadow-xl shadow-red-600/20 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span>Secure Login</span>
                                    <ShieldCheck className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors flex items-center justify-center gap-2">
                            ← Return to Dashboard
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-600 mt-8 uppercase tracking-[0.2em] font-bold">
                    Property of StockAnalyst Systems • Authorised Access Only
                </p>
            </div>
        </div>
    );
};

export default AdminLoginPage;
