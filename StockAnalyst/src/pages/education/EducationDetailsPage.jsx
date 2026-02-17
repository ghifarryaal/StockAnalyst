import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    ArrowLeft,
    User,
    Calendar,
    TrendingUp,
    ExternalLink,
    Loader2,
    AlertCircle,
    Flag
} from 'lucide-react';
import { getPostById } from '../../services/educationService';
import Navbar from '../../components/Navbar';
import ReactionButtons from '../../components/education/ReactionButtons';
import ShareButton from '../../components/education/ShareButton';
import ReportModal from '../../components/education/ReportModal';

const EducationDetailsPage = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadPost();
    }, [postId]);

    const loadPost = async () => {
        setLoading(true);
        setError('');

        try {
            const { post: fetchedPost, error: fetchError } = await getPostById(postId);

            if (fetchError) {
                setError(fetchError);
            } else if (!fetchedPost) {
                setError('Post tidak ditemukan.');
            } else {
                setPost(fetchedPost);
            }
        } catch (err) {
            console.error('Exception in EducationDetailsPage:', err);
            setError(err.message);
        }

        setLoading(false);
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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-4">
                <div className="bg-red-900/20 border border-red-500 rounded-2xl p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                    <p className="text-red-300 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/education')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-all shadow-lg shadow-blue-500/20"
                    >
                        Kembali ke Feed
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
            <Navbar />

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/education')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>Kembali ke Feed</span>
                </button>

                <article className="bg-slate-900/50 border border-slate-700 rounded-3xl overflow-hidden backdrop-blur-sm shadow-xl">
                    {/* Hero Section */}
                    <div className="p-8 md:p-12 border-b border-slate-800">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className={`px-4 py-1.5 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-full text-xs font-bold text-white shadow-lg`}>
                                {getCategoryLabel(post.category)}
                            </span>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{post.ticker}</span>
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">{post.educator?.full_name}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                        {post.educator_profile?.verification_status === 'approved' && (
                                            <span className="text-green-400 font-bold flex items-center gap-1">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                                Verified Educator
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <ShareButton postId={post.id} postTitle={post.title} />
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="p-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-2xl transition-all border border-red-500/20 group"
                                    title="Laporkan post"
                                >
                                    <Flag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Body Section */}
                    <div className="p-8 md:p-12">
                        <div className="prose prose-invert prose-blue max-w-none">
                            <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                                {post.content}
                            </p>
                        </div>

                        {/* References */}
                        {post.reference_links && post.reference_links.length > 0 && (
                            <div className="mt-12 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <ExternalLink className="w-5 h-5 text-blue-400" />
                                    Referensi & Sumber
                                </h3>
                                <div className="space-y-3">
                                    {post.reference_links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 bg-slate-900/50 hover:bg-slate-900 rounded-xl text-blue-400 hover:text-blue-300 transition-all text-sm truncate border border-slate-700/30"
                                        >
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer / Interaction */}
                    <div className="p-8 md:p-12 bg-slate-800/30 border-t border-slate-800 flex items-center justify-center">
                        <div className="scale-125">
                            <ReactionButtons
                                postId={post.id}
                                initialLikes={post.likes_count || 0}
                                initialDislikes={post.dislikes_count || 0}
                            />
                        </div>
                    </div>
                </article>
            </main>

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    postId={post.id}
                    postTitle={post.title}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default EducationDetailsPage;
