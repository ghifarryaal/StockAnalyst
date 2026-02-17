import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Filter, Search, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPosts } from '../../services/educationService';
import PostCard from '../../components/education/PostCard';
import Navbar from '../../components/Navbar';

const EducationFeedPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        ticker: '',
        search: ''
    });

    const categories = [
        { value: '', label: 'Semua Kategori' },
        { value: 'sentiment', label: 'Sentimen' },
        { value: 'news', label: 'Berita' },
        { value: 'fundamental', label: 'Fundamental' },
        { value: 'technical', label: 'Teknikal' }
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadPosts();
    }, [filters.category, filters.ticker, isAuthenticated]);

    const loadPosts = async () => {
        setLoading(true);
        setError('');

        const { posts: fetchedPosts, error: fetchError } = await getPosts({
            category: filters.category || undefined,
            ticker: filters.ticker || undefined,
            limit: 20
        });

        if (fetchError) {
            setError(fetchError);
        } else {
            setPosts(fetchedPosts);
        }

        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117]">
            <Navbar />

            {/* Sub-Header / Page Title */}
            <div className="bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/20">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Edukasi Saham</h1>
                            <p className="text-sm text-gray-400">Belajar strategi dari para educator profesional</p>
                        </div>
                    </div>

                    {isAuthenticated && user?.role === 'educator' && (
                        <button
                            onClick={() => navigate('/education/create')}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            + Buat Post
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Filters */}
                <div className="mb-6 flex flex-col md:flex-row gap-4">
                    {/* Category Filter */}
                    <div className="flex-1">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Ticker Filter */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={filters.ticker}
                                onChange={(e) => handleFilterChange('ticker', e.target.value.toUpperCase())}
                                placeholder="Filter by ticker (e.g., BBCA)"
                                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            />
                        </div>
                    </div>
                </div>

                {/* Posts List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">Memuat posts...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-400 mb-1">Error</h3>
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                            <GraduationCap className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Belum Ada Post
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {filters.category || filters.ticker
                                ? 'Tidak ada post yang sesuai dengan filter Anda.'
                                : 'Belum ada konten edukasi. Jadilah yang pertama!'}
                        </p>
                        {isAuthenticated && user?.role === 'educator' && (
                            <button
                                onClick={() => navigate('/education/create')}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all"
                            >
                                Buat Post Pertama
                            </button>
                        )}
                        {!isAuthenticated && (
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => navigate('/register/educator')}
                                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all"
                                >
                                    Daftar sebagai Educator
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onCategoryClick={(cat) => handleFilterChange('category', cat)}
                                onTickerClick={(ticker) => handleFilterChange('ticker', ticker)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EducationFeedPage;
