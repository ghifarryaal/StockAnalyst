import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toggleReaction, getUserReaction } from '../../services/reactionService';

const ReactionButtons = ({ postId, initialLikes = 0, initialDislikes = 0, onReactionChange }) => {
    const { isAuthenticated } = useAuth();

    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [userReaction, setUserReaction] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            loadUserReaction();
        }
    }, [postId, isAuthenticated]);

    useEffect(() => {
        setLikes(initialLikes);
        setDislikes(initialDislikes);
    }, [initialLikes, initialDislikes]);

    const loadUserReaction = async () => {
        const { reaction } = await getUserReaction(postId);
        setUserReaction(reaction?.reaction_type || null);
    };

    const handleReaction = async (type) => {
        if (!isAuthenticated) {
            // Could show a toast or modal here
            alert('Silakan login untuk memberikan reaksi');
            return;
        }

        if (loading) return;

        setLoading(true);

        // Optimistic update
        const prevLikes = likes;
        const prevDislikes = dislikes;
        const prevUserReaction = userReaction;

        // Calculate new counts optimistically
        let newLikes = likes;
        let newDislikes = dislikes;
        let newUserReaction = null;

        if (type === 'like') {
            if (userReaction === 'like') {
                // Remove like
                newLikes--;
                newUserReaction = null;
            } else if (userReaction === 'dislike') {
                // Change from dislike to like
                newDislikes--;
                newLikes++;
                newUserReaction = 'like';
            } else {
                // Add like
                newLikes++;
                newUserReaction = 'like';
            }
        } else { // dislike
            if (userReaction === 'dislike') {
                // Remove dislike
                newDislikes--;
                newUserReaction = null;
            } else if (userReaction === 'like') {
                // Change from like to dislike
                newLikes--;
                newDislikes++;
                newUserReaction = 'dislike';
            } else {
                // Add dislike
                newDislikes++;
                newUserReaction = 'dislike';
            }
        }

        // Update UI optimistically
        setLikes(newLikes);
        setDislikes(newDislikes);
        setUserReaction(newUserReaction);

        // Make API call
        const { error, action } = await toggleReaction(postId, type);

        if (error) {
            // Revert on error
            setLikes(prevLikes);
            setDislikes(prevDislikes);
            setUserReaction(prevUserReaction);
            console.error('Error toggling reaction:', error);
        } else {
            // Notify parent component if callback provided
            if (onReactionChange) {
                onReactionChange({ likes: newLikes, dislikes: newDislikes, action });
            }
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center gap-4">
            {/* Like Button */}
            <button
                onClick={() => handleReaction('like')}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${userReaction === 'like'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-blue-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading && userReaction === 'like' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <ThumbsUp className={`w-5 h-5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
                )}
                <span>{likes}</span>
            </button>

            {/* Dislike Button */}
            <button
                onClick={() => handleReaction('dislike')}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${userReaction === 'dislike'
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700 hover:text-red-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading && userReaction === 'dislike' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <ThumbsDown className={`w-5 h-5 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
                )}
                <span>{dislikes}</span>
            </button>
        </div>
    );
};

export default ReactionButtons;
