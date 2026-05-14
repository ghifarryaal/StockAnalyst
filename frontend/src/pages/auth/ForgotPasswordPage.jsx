import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { resetPassword } from '../../services/authService';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: resetError } = await resetPassword(email);

        if (resetError) {
            setError(resetError);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-gradient-to-tr from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
                            <Mail className="w-10 h-10 text-white" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-4">Email Terkirim!</h2>

                        <div className="bg-orange-900/10 border border-orange-500/20 rounded-xl p-6 mb-8 text-left">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Instruksi pemulihan telah dikirim ke <strong className="text-orange-400">{email}</strong>.
                                Silakan periksa kotak masuk atau folder spam Anda.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Status</p>
                                <p className="text-xs font-bold text-green-400">Siap Reset</p>
                            </div>
                            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Berlaku</p>
                                <p className="text-xs font-bold text-gray-300">60 Menit</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/login')}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke Login
                </button>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Lupa Password?</h1>
                        <p className="text-gray-400 text-sm">
                            Masukkan email Anda untuk menerima link reset password
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    Kirim Link Reset
                                </>
                            )}
                        </button>
                    </form>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-400">
                            💡 Anda akan menerima email dengan link untuk membuat password baru. Link berlaku selama 1 jam.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
