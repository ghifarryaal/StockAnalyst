import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { createPost } from '../../services/educationService';
import PostForm from '../../components/education/PostForm';
import { Mail, GraduationCap, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const checkVerification = async () => {
            if (!user || user.role !== 'educator') {
                setVerifying(false);
                return;
            }

            try {
                const { data, error: profileError } = await supabase
                    .from('educator_profiles')
                    .select('verification_status')
                    .eq('educator_id', user.id)
                    .maybeSingle();

                if (profileError) throw profileError;
                setIsVerified(data?.verification_status === 'approved');
            } catch (err) {
                console.error('Error checking verification:', err);
            } finally {
                setVerifying(false);
            }
        };

        checkVerification();
    }, [user]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        setError('');

        const { post, error: createError } = await createPost(formData);

        if (createError) {
            setError(createError);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            navigate(`/education/${post.id}`);
        }, 2000);
    };

    const handleCancel = () => {
        navigate('/education');
    };

    // Check if user is educator
    if (verifying) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!user || user.role !== 'educator') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-red-500 rounded-xl p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Akses Ditolak</h2>
                    <p className="text-gray-400 mb-6">
                        Hanya educator yang dapat membuat post edukasi.
                    </p>
                    <button
                        onClick={() => navigate('/education')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        Kembali ke Feed
                    </button>
                </div>
            </div>
        );
    }

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-yellow-500/50 rounded-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Akun Belum Terverifikasi</h2>
                    <p className="text-gray-400 mb-6">
                        Maaf, akun educator Anda belum disetujui oleh Admin. Anda baru dapat membuat postingan setelah status verifikasi Anda menjadi "Approved".
                    </p>
                    <button
                        onClick={() => navigate('/education')}
                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-yellow-600/20"
                    >
                        Kembali ke Feed
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-green-500 rounded-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Post Berhasil Dibuat!</h2>
                    <p className="text-gray-400 mb-4">
                        Post edukasi Anda telah dipublikasikan.
                    </p>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Buat Post Edukasi</h1>
                            <p className="text-sm text-gray-400">Bagikan pengetahuan Anda</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 md:p-8">
                    {/* Info Box */}
                    <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h3 className="font-semibold text-blue-400 mb-2">📝 Panduan Menulis</h3>
                        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                            <li>Berikan analisis yang objektif dan edukatif</li>
                            <li>Sertakan data dan referensi yang valid</li>
                            <li>Hindari promosi saham untuk keuntungan pribadi</li>
                            <li>Maksimal 2500 karakter untuk konten</li>
                        </ul>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                            <p className="text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <PostForm
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
