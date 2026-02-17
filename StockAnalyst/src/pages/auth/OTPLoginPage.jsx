import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { sendOTP, verifyOTP } from '../../services/authService';

const OTPLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [canResend, setCanResend] = useState(false);
    const [countdown, setCountdown] = useState(60);

    // If email is passed from registration, show a tip
    useEffect(() => {
        if (location.state?.email) {
            setSuccess(`Registrasi berhasil! Kami telah menyiapkan email ${location.state.email} untuk Anda.`);
        }
    }, [location.state?.email]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error: otpError } = await sendOTP(email);

        if (otpError) {
            setError(otpError);
            setLoading(false);
            return;
        }

        setSuccess('OTP telah dikirim ke email Anda!');
        setStep(2);
        setLoading(false);
        startCountdown();
    };

    const startCountdown = () => {
        setCanResend(false);
        setCountdown(60);

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        setError('');
        setLoading(true);

        const { error: otpError } = await sendOTP(email);

        if (otpError) {
            setError(otpError);
        } else {
            setSuccess('OTP baru telah dikirim!');
            startCountdown();
        }

        setLoading(false);
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Masukkan kode OTP 6 digit');
            setLoading(false);
            return;
        }

        const { user, error: verifyError } = await verifyOTP(email, otpCode);

        if (verifyError) {
            setError(verifyError);
            setLoading(false);
            return;
        }

        // Success - redirect based on role
        if (user.role === 'admin') {
            navigate('/dashboard/admin');
        } else if (user.role === 'educator') {
            navigate('/dashboard/educator');
        } else {
            navigate('/education');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Back Button */}
                <button
                    onClick={() => step === 1 ? navigate('/login') : setStep(1)}
                    className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {step === 1 ? 'Kembali ke Login' : 'Ubah Email'}
                </button>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Login Aman (OTP)</h1>
                        <p className="text-gray-400 text-sm">
                            {step === 1 ? 'Gunakan verifikasi dua langkah untuk masuk ke sistem' : 'Demi keamanan, masukkan kode OTP yang baru saja kami kirimkan'}
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-400">{success}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="nama@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Mengirim OTP...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-5 h-5" />
                                        Kirim OTP
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Enter OTP */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                                    Kode OTP dikirim ke: <span className="text-blue-400">{email}</span>
                                </label>

                                {/* OTP Input */}
                                <div className="flex gap-2 justify-center mb-4">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            id={`otp-${index}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={loading}
                                        />
                                    ))}
                                </div>

                                {/* Resend OTP */}
                                <div className="text-center">
                                    {canResend ? (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            disabled={loading}
                                        >
                                            Kirim ulang OTP
                                        </button>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Kirim ulang dalam {countdown} detik
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length !== 6}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Verifikasi & Login
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-400">
                            🔐 Verifikasi OTP memastikan bahwa hanya pemilik email sah yang dapat mengakses akun dashboard ini.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPLoginPage;
