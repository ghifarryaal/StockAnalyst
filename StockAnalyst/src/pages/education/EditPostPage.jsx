import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, GraduationCap, CheckCircle, AlertCircle, Loader2, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { getPostById, updatePost } from '../../services/educationService';
import PostForm from '../../components/education/PostForm';

const EditPostPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [post, setPost] = useState(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadPost = async () => {
            if (!user) return;

            try {
                // Check verification status first
                const { data: profile, error: profileError } = await supabase
                    .from('educator_profiles')
                    .select('verification_status')
                    .eq('educator_id', user.id)
                    .maybeSingle();

                if (profileError) throw profileError;

                if (profile?.verification_status !== 'approved') {
                    setError('Akun Anda belum terverifikasi. Anda tidak dapat mengedit post.');
                    setLoading(false);
                    return;
                }

                const { post: postData, error: postError } = await getPostById(postId);

                if (postError) {
                    setError(postError);
                } else if (!postData) {
                    setError('Post tidak ditemukan.');
                } else if (postData.educator_id !== user.id) {
                    setError('Anda tidak memiliki izin untuk mengedit post ini.');
                } else {
                    setPost(postData);
                }
            } catch (err) {
                console.error('Error loading post:', err);
                setError('Terjadi kesalahan saat memuat data.');
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [postId, user]);

    const handleSubmit = async (formData) => {
        setSubmitting(true);
        setError('');

        const { post: updatedPost, error: updateError } = await updatePost(postId, formData);

        if (updateError) {
            setError(updateError);
            setSubmitting(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            navigate(`/education/${postId}`);
        }, 2000);
    };

    const handleCancel = () => {
        navigate('/dashboard/educator');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-red-500 rounded-xl p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Kesalahan</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/dashboard/educator')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        Kembali ke Dashboard
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
                    <h2 className="text-2xl font-bold text-white mb-2">Post Berhasil Diupdate!</h2>
                    <p className="text-gray-400 mb-4">
                        Perubahan Anda telah disimpan.
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
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                            <Save className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Edit Post Edukasi</h1>
                            <p className="text-sm text-gray-400">{post.ticker} - {post.title}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 md:p-8">
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
                        loading={submitting}
                        initialData={{
                            title: post.title,
                            ticker: post.ticker,
                            category: post.category,
                            content: post.content,
                            referenceLinks: post.reference_links || []
                        }}
                        isEdit={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EditPostPage;
