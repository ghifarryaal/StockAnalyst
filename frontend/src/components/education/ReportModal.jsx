import React, { useState } from 'react';
import { X, Flag, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { reportPost, hasUserReportedPost } from '../../services/reportService';
import { useAuth } from '../../contexts/AuthContext';

const ReportModal = ({ postId, postTitle, onClose }) => {
    const { isAuthenticated } = useAuth();

    const [reason, setReason] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const reportCategories = [
        { value: 'misleading', label: 'Informasi Menyesatkan' },
        { value: 'spam', label: 'Spam atau Promosi' },
        { value: 'inappropriate', label: 'Konten Tidak Pantas' },
        { value: 'manipulation', label: 'Manipulasi Pasar' },
        { value: 'other', label: 'Lainnya' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setError('Silakan login untuk melaporkan post');
            return;
        }

        if (!selectedCategory) {
            setError('Pilih kategori laporan');
            return;
        }

        if (!reason.trim()) {
            setError('Berikan alasan laporan');
            return;
        }

        setLoading(true);
        setError('');

        const fullReason = `[${reportCategories.find(c => c.value === selectedCategory)?.label}] ${reason}`;
        const { report, error: reportError } = await reportPost(postId, fullReason);

        if (reportError) {
            setError(reportError);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setTimeout(() => {
            onClose();
        }, 2000);
    };

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-green-500 rounded-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Laporan Terkirim</h3>
                    <p className="text-gray-400">
                        Terima kasih. Tim moderator akan meninjau laporan Anda.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-600/20 rounded-lg">
                            <Flag className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Laporkan Post</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Post Title */}
                    <div className="p-3 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Post yang dilaporkan:</p>
                        <p className="text-white font-semibold">{postTitle}</p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Kategori Laporan *
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="">Pilih kategori...</option>
                            {reportCategories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Alasan Laporan *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            placeholder="Jelaskan mengapa Anda melaporkan post ini..."
                            disabled={loading}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-400">
                            ℹ️ Laporan akan ditinjau oleh tim moderator. Penyalahgunaan fitur laporan dapat mengakibatkan sanksi.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold transition-colors"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <Flag className="w-5 h-5" />
                                    Kirim Laporan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportModal;
