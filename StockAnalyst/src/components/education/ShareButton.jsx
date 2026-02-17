import React, { useState } from 'react';
import { Share2, Check, Copy, X } from 'lucide-react';

const ShareButton = ({ postId, postTitle }) => {
    const [showModal, setShowModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}/education/${postId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = async () => {
        // Check if Web Share API is available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: postTitle,
                    text: `Baca artikel edukasi saham: ${postTitle}`,
                    url: shareUrl
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    setShowModal(true);
                }
            }
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            <button
                onClick={handleShare}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
                title="Bagikan post"
            >
                <Share2 className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </button>

            {/* Share Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Bagikan Post</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Share Link */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Link Post
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                                    />
                                    <button
                                        onClick={handleCopy}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Social Share Buttons */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bagikan ke
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`${postTitle}\n${shareUrl}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-center transition-colors"
                                    >
                                        WhatsApp
                                    </a>
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(shareUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-center transition-colors"
                                    >
                                        Twitter
                                    </a>
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-semibold text-center transition-colors"
                                    >
                                        Facebook
                                    </a>
                                    <a
                                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(postTitle)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-blue-400 hover:bg-blue-500 rounded-lg font-semibold text-center transition-colors"
                                    >
                                        Telegram
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShareButton;
