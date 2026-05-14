import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { stockIndustryMap } from '../stockIndustryData';

const PostForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        ticker: initialData?.ticker || '',
        category: initialData?.category || 'fundamental',
        content: initialData?.content || '',
        referenceLinks: initialData?.reference_links || ['']
    });
    const [errors, setErrors] = useState({});

    const categories = [
        { value: 'sentiment', label: 'Sentimen', color: 'purple' },
        { value: 'news', label: 'Berita', color: 'blue' },
        { value: 'fundamental', label: 'Fundamental', color: 'green' },
        { value: 'technical', label: 'Teknikal', color: 'orange' }
    ];

    // Get all tickers from stockIndustryMap
    const allTickers = Object.keys(stockIndustryMap).sort();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...formData.referenceLinks];
        newLinks[index] = value;
        setFormData(prev => ({ ...prev, referenceLinks: newLinks }));
    };

    const addLink = () => {
        setFormData(prev => ({
            ...prev,
            referenceLinks: [...prev.referenceLinks, '']
        }));
    };

    const removeLink = (index) => {
        setFormData(prev => ({
            ...prev,
            referenceLinks: prev.referenceLinks.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Judul harus diisi';
        }

        if (!formData.ticker.trim()) {
            newErrors.ticker = 'Ticker harus diisi';
        } else if (!stockIndustryMap[formData.ticker.toUpperCase()]) {
            newErrors.ticker = 'Ticker tidak valid';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Konten harus diisi';
        } else if (formData.content.length > 2500) {
            newErrors.content = `Konten melebihi batas (${formData.content.length}/2500 karakter)`;
        }

        // Validate reference links
        const validLinks = formData.referenceLinks.filter(link => link.trim());
        for (const link of validLinks) {
            try {
                new URL(link);
            } catch {
                newErrors.referenceLinks = 'Salah satu link tidak valid';
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Filter out empty links
        const cleanedData = {
            ...formData,
            ticker: formData.ticker.toUpperCase(),
            referenceLinks: formData.referenceLinks.filter(link => link.trim())
        };

        onSubmit(cleanedData);
    };

    const charCount = formData.content.length;
    const charLimit = 2500;
    const charPercentage = (charCount / charLimit) * 100;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Judul Post *
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Analisis Fundamental BBCA Q4 2024"
                    disabled={loading}
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.title}
                    </p>
                )}
            </div>

            {/* Ticker & Category */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Ticker */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ticker Saham *
                    </label>
                    <input
                        type="text"
                        name="ticker"
                        value={formData.ticker}
                        onChange={handleChange}
                        list="ticker-suggestions"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                        placeholder="BBCA"
                        disabled={loading}
                    />
                    <datalist id="ticker-suggestions">
                        {allTickers.map(ticker => (
                            <option key={ticker} value={ticker} />
                        ))}
                    </datalist>
                    {errors.ticker && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.ticker}
                        </p>
                    )}
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Kategori *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                        Konten Edukasi *
                    </label>
                    <span className={`text-sm ${charCount > charLimit ? 'text-red-400' : charPercentage > 80 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {charCount}/{charLimit}
                    </span>
                </div>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tulis konten edukasi Anda di sini... (maksimal 2500 karakter)"
                    disabled={loading}
                />
                {/* Character count bar */}
                <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${charCount > charLimit ? 'bg-red-500' :
                                charPercentage > 80 ? 'bg-yellow-500' :
                                    'bg-blue-500'
                            }`}
                        style={{ width: `${Math.min(charPercentage, 100)}%` }}
                    />
                </div>
                {errors.content && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.content}
                    </p>
                )}
            </div>

            {/* Reference Links */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link Referensi (Opsional)
                </label>
                <div className="space-y-2">
                    {formData.referenceLinks.map((link, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => handleLinkChange(index, e.target.value)}
                                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com"
                                disabled={loading}
                            />
                            {formData.referenceLinks.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                    disabled={loading}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {errors.referenceLinks && (
                    <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.referenceLinks}
                    </p>
                )}
                {formData.referenceLinks.length < 5 && (
                    <button
                        type="button"
                        onClick={addLink}
                        className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        disabled={loading}
                    >
                        + Tambah Link
                    </button>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-semibold transition-colors"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Menyimpan...
                        </>
                    ) : (
                        initialData ? 'Update Post' : 'Publikasikan'
                    )}
                </button>
            </div>
        </form>
    );
};

export default PostForm;
