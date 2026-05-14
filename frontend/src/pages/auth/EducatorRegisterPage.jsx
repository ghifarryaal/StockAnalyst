import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle, Award, FileText, KeyRound } from 'lucide-react';
import { registerEducator } from '../../services/authService';

const EducatorRegisterPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        certificateNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Nama lengkap harus diisi');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email harus diisi');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok');
            return false;
        }
        if (!formData.certificateNumber.trim()) {
            setError('Nomor sertifikat harus diisi');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const { user, error: regError } = await registerEducator({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                certificateNumber: formData.certificateNumber
            });

            if (regError) {
                setError(regError);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { state: { email: formData.email } });
            }, 5000);
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900/50 border border-green-500 rounded-2xl p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Registrasi Berhasil!</h2>
                        <p className="text-gray-400 mb-6 text-sm">
                            Akun educator Anda telah dibuat dan sedang menunggu verifikasi admin.
                        </p>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-6 text-left">
                            <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Langkah Berikutnya: Cek Email
                            </h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Kami telah mengirimkan instruksi verifikasi ke email Anda. Harap verifikasi akun Anda terlebih dahulu.
                            </p>

                            <hr className="border-slate-700 my-4" />

                            <h4 className="text-gray-300 text-sm font-semibold mb-2">Gunakan Verifikasi OTP:</h4>
                            <button
                                onClick={() => navigate('/login/otp')}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <KeyRound className="w-5 h-5" />
                                Verifikasi dengan OTP →
                            </button>
                        </div>

                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                            <p className="text-xs text-yellow-400 flex items-center justify-center gap-2">
                                ⏳ Akun dalam antrian verifikasi admin.
                            </p>
                        </div>

                        <p className="text-xs text-gray-500">
                            Masalah menerima email? Periksa folder spam atau coba kirim ulang nanti.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                        StockAnalyst Educator
                    </h1>
                    <p className="text-gray-400">Daftar sebagai Educator</p>
                </div>

                {/* Register Form */}
                <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Daftar Educator</h2>
                            <p className="text-sm text-gray-400">Berbagi edukasi saham</p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-sm text-blue-400">
                            ℹ️ Akun educator akan diverifikasi oleh admin sebelum dapat membuat post edukasi.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                />
                            </div>
                        </div>

                        {/* Certificate Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nomor Sertifikat
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="certificateNumber"
                                    value={formData.certificateNumber}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Contoh: CERT-2024-001"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Masukkan nomor sertifikat analis saham atau sertifikasi terkait
                            </p>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Minimal 6 karakter"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Ulangi password"
                                />
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
                            <p className="text-xs text-gray-400">
                                Dengan mendaftar sebagai educator, Anda setuju untuk:
                            </p>
                            <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                                <li>Memberikan edukasi yang akurat dan tidak menyesatkan</li>
                                <li>Tidak mempromosikan saham tertentu untuk keuntungan pribadi</li>
                                <li>Mematuhi kode etik analis saham</li>
                            </ul>
                            <Link to="/terms" className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block">
                                Baca Terms & Conditions lengkap →
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mendaftar...
                                </>
                            ) : (
                                <>
                                    <Award className="w-5 h-5" />
                                    Daftar sebagai Educator
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
                                Login di sini
                            </Link>
                        </p>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-4 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
                            ← Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EducatorRegisterPage;
