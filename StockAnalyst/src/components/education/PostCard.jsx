import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Calendar, User, TrendingUp } from 'lucide-react';
import ReactionButtons from './ReactionButtons';
import ShareButton from './ShareButton';
import ReportModal from './ReportModal';

const PostCard = ({ post, onCategoryClick, onTickerClick }) => {
    const navigate = useNavigate();
    const [showReportModal, setShowReportModal] = useState(false);

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const truncateContent = (content, maxLength = 200) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <>
            <div
                className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-200 group"
            >
                {/* Header */}
                <div
                    onClick={() => navigate(`/education/${post.id}`)}
                    className="cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            {/* Category & Ticker */}
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onCategoryClick) onCategoryClick(post.category);
                                    }}
                                    className={`px-3 py-1 bg-gradient-to-r ${getCategoryColor(post.category)} rounded-full text-xs font-semibold hover:scale-105 transition-transform`}
                                >
                                    {getCategoryLabel(post.category)}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onTickerClick) onTickerClick(post.ticker);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full hover:bg-blue-600/30 transition-colors"
                                >
                                    <TrendingUp className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs font-bold text-blue-400">{post.ticker}</span>
                                </button>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                {post.title}
                            </h3>

                            {/* Educator Info */}
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <User className="w-4 h-4" />
                                <span>{post.educator?.full_name || 'Unknown Educator'}</span>
                                {post.educator_profile?.verification_status === 'approved' && (
                                    <span className="text-green-400">✓ Verified</span>
                                )}
                                <span>•</span>
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-300 mb-4 leading-relaxed">
                        {truncateContent(post.content)}
                    </p>

                    {/* Reference Links */}
                    {post.reference_links && post.reference_links.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Referensi:</p>
                            <div className="flex flex-wrap gap-2">
                                {post.reference_links.slice(0, 2).map((link, index) => (
                                    <a
                                        key={index}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                                    >
                                        Link {index + 1}
                                    </a>
                                ))}
                                {post.reference_links.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                        +{post.reference_links.length - 2} lainnya
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Interactive */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                    <ReactionButtons
                        postId={post.id}
                        initialLikes={post.likes_count || 0}
                        initialDislikes={post.dislikes_count || 0}
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowReportModal(true);
                            }}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                            title="Laporkan post"
                        >
                            <Flag className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                        </button>

                        <ShareButton postId={post.id} postTitle={post.title} />
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <ReportModal
                    postId={post.id}
                    postTitle={post.title}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </>
    );
};

export default PostCard;
