import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, ThumbsUp, ThumbsDown, FileText, TrendingUp, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPostsByEducator, deletePost } from '../../services/educationService';
import { supabase } from '../../services/supabaseClient';

const EducatorDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalPosts: 0,
        totalLikes: 0,
        totalDislikes: 0,
        verificationStatus: 'pending'
    });
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingPostId, setDeletingPostId] = useState(null);

    useEffect(() => {
        if (user && user.role === 'educator') {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // Get educator profile
            const { data: profile, error: profileError } = await supabase
                .from('educator_profiles')
                .select('*')
                .eq('educator_id', user.id)
                .maybeSingle();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
            }

            // Get educator posts
            const { posts: educatorPosts, error: postsError } = await getPostsByEducator(user.id);

            if (postsError) {
                setError(postsError);
            } else {
                // Calculate stats from active posts
                const activePosts = educatorPosts.filter(p => !p.is_deleted);
                const totalLikes = activePosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
                const totalDislikes = activePosts.reduce((sum, p) => sum + (p.dislikes_count || 0), 0);

                setPosts(activePosts);
                setStats({
                    totalPosts: activePosts.length,
                    totalLikes: totalLikes,
                    totalDislikes: totalDislikes,
                    verificationStatus: profile?.verification_status || (profileError ? 'not_found' : 'pending')
                });
            }
        } catch (err) {
            console.error('Exception loading dashboard:', err);
            setError(err.message);
        }

        setLoading(false);
    };

    const handleDeletePost = async (postId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus post ini?')) {
            return;
        }

        setDeletingPostId(postId);
        const { success, error: deleteError } = await deletePost(postId);

        if (deleteError) {
            alert(`Error: ${deleteError}`);
        } else {
            // Remove from list
            setPosts(posts.filter(p => p.id !== postId));
            setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
        }

        setDeletingPostId(null);
    };

    const getVerificationBadge = (status) => {
        const badges = {
            pending: { text: 'Menunggu Verifikasi', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30' },
            approved: { text: 'Terverifikasi ✓', color: 'bg-green-600/20 text-green-400 border-green-500/30' },
            rejected: { text: 'Ditolak', color: 'bg-red-600/20 text-red-400 border-red-500/30' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    const getCategoryColor = (category) => {
        const colors = {
            sentiment: 'from-purple-600 to-pink-600',
            news: 'from-blue-600 to-cyan-600',
            fundamental: 'from-green-600 to-emerald-600',
            technical: 'from-orange-600 to-red-600'
        };
        return colors[category] || 'from-gray-600 to-gray-700';
    };

    const getCategoryLabel = (category) => {
        const labels = {
            sentiment: 'Sentimen',
            news: 'Berita',
            fundamental: 'Fundamental',
            technical: 'Teknikal'
        };
        return labels[category] || category;
    };

    if (!user || user.role !== 'educator') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-red-500 rounded-xl p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Akses Ditolak</h2>
                    <p className="text-gray-400 mb-6">
                        Halaman ini hanya untuk educator.
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
            {/* Header */}
            <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/education')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Educator Dashboard</h1>
                                <p className="text-sm text-gray-400">{user.full_name}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/education/create')}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all"
                    >
                        + Buat Post Baru
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Verification Status */}
                        <div className="mb-6 p-4 bg-slate-900/50 border border-slate-700 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Status Verifikasi</p>
                                {stats.verificationStatus === 'not_found' ? (
                                    <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-red-600/20 text-red-400 border-red-500/30">
                                        Profil Belum Terdaftar
                                    </span>
                                ) : (
                                    getVerificationBadge(stats.verificationStatus)
                                )}
                            </div>
                            {stats.verificationStatus === 'pending' && (
                                <p className="text-sm text-gray-400">
                                    Akun Anda sedang dalam proses verifikasi oleh admin
                                </p>
                            )}
                            {stats.verificationStatus === 'not_found' && (
                                <p className="text-sm text-red-400">
                                    Profil educator Anda belum ditemukan. Silakan hubungi dukungan jika Anda belum mendaftar sebagai educator.
                                </p>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {/* Total Posts */}
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-600/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalPosts}</h3>
                                <p className="text-sm text-gray-400">Total Posts</p>
                            </div>

                            {/* Total Likes */}
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-green-600/20 rounded-lg">
                                        <ThumbsUp className="w-6 h-6 text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalLikes}</h3>
                                <p className="text-sm text-gray-400">Total Likes</p>
                            </div>

                            {/* Total Dislikes */}
                            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-red-600/20 rounded-lg">
                                        <ThumbsDown className="w-6 h-6 text-red-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1">{stats.totalDislikes}</h3>
                                <p className="text-sm text-gray-400">Total Dislikes</p>
                            </div>
                        </div>

                        {/* My Posts */}
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Post Saya</h2>

                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 mb-4">Belum ada post</p>
                                    <button
                                        onClick={() => navigate('/education/create')}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all"
                                    >
                                        Buat Post Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {posts.map(post => (
                                        <div
                                            key={post.id}
                                            className="bg-slate-800/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-2 py-1 bg-gradient-to-r ${getCategoryColor(post.category)} rounded text-xs font-semibold`}>
                                                            {getCategoryLabel(post.category)}
                                                        </span>
                                                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-bold">
                                                            {post.ticker}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-bold text-white mb-2">{post.title}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsUp className="w-4 h-4" />
                                                            {post.likes_count || 0}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <ThumbsDown className="w-4 h-4" />
                                                            {post.dislikes_count || 0}
                                                        </span>
                                                        <span>
                                                            {new Date(post.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/education/edit/${post.id}`)}
                                                        className="p-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                                                        title="Edit post"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        disabled={deletingPostId === post.id}
                                                        className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Hapus post"
                                                    >
                                                        {deletingPostId === post.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EducatorDashboard;
