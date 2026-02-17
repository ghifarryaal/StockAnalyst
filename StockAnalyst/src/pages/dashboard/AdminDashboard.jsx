import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Flag, Users, CheckCircle, XCircle, Eye, Loader2, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getReports, reviewReport } from '../../services/reportService';
import { adminDeletePost } from '../../services/educationService';
import { supabase } from '../../services/supabaseClient';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState('reports');
    const [reports, setReports] = useState([]);
    const [educators, setEducators] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [stats, setStats] = useState({
        pendingReports: 0,
        pendingEducators: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        if (user && user.role === 'admin') {
            loadDashboardData();
        }
    }, [user, activeTab]);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // Load stats
            const { data: usersData } = await supabase
                .from('users')
                .select('id', { count: 'exact' });

            const { data: pendingEducatorsData } = await supabase
                .from('educator_profiles')
                .select('id', { count: 'exact' })
                .eq('verification_status', 'pending');

            setStats({
                totalUsers: usersData?.length || 0,
                pendingEducators: pendingEducatorsData?.length || 0,
                pendingReports: 0 // Will be updated when loading reports
            });

            // Load data based on active tab
            if (activeTab === 'reports') {
                const { reports: reportsData, error: reportsError } = await getReports('pending');
                if (reportsError) {
                    setError(reportsError);
                } else {
                    setReports(reportsData);
                    setStats(prev => ({ ...prev, pendingReports: reportsData.length }));
                }
            } else if (activeTab === 'educators') {
                const { data: educatorsData, error: educatorsError } = await supabase
                    .from('educator_profiles')
                    .select(`
            *,
            educator:users!educator_id (
              id,
              full_name,
              email
            )
          `)
                    .eq('verification_status', 'pending')
                    .order('created_at', { ascending: false });

                if (educatorsError) {
                    setError(educatorsError.message);
                } else {
                    setEducators(educatorsData || []);
                }
            } else if (activeTab === 'users') {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (usersError) {
                    setError(usersError.message);
                } else {
                    setAllUsers(usersData || []);
                }
            }
        } catch (err) {
            console.error('Exception loading dashboard:', err);
            setError(err.message);
        }

        setLoading(false);
    };

    const handleReviewReport = async (reportId, action) => {
        setProcessingId(reportId);

        const status = action === 'approve' ? 'reviewed' : 'dismissed';
        const { error: reviewError } = await reviewReport(reportId, status);

        if (reviewError) {
            alert(`Error: ${reviewError}`);
        } else {
            // If approved, optionally delete the post
            if (action === 'approve') {
                const report = reports.find(r => r.id === reportId);
                if (report && confirm('Hapus post yang dilaporkan?')) {
                    await adminDeletePost(report.post_id, report.reason);
                }
            }

            // Remove from list
            setReports(reports.filter(r => r.id !== reportId));
            setStats(prev => ({ ...prev, pendingReports: prev.pendingReports - 1 }));
        }

        setProcessingId(null);
    };

    const handleVerifyEducator = async (educatorId, action) => {
        setProcessingId(educatorId);

        try {
            const status = action === 'approve' ? 'approved' : 'rejected';
            const { error: updateError } = await supabase
                .from('educator_profiles')
                .update({
                    verification_status: status,
                    verified_at: new Date().toISOString(),
                    verified_by: user.id
                })
                .eq('educator_id', educatorId);

            if (updateError) {
                alert(`Gagal memverifikasi: ${updateError.message}`);
                console.error('Verification error:', updateError);
            } else {
                setFeedback({
                    type: 'success',
                    message: action === 'approve' ? 'Educator berhasil diverifikasi!' : 'Pendaftaran educator ditolak.'
                });

                // Refresh list
                setEducators(educators.filter(e => e.educator_id !== educatorId));
                setStats(prev => ({ ...prev, pendingEducators: Math.max(0, prev.pendingEducators - 1) }));

                // Hide message after delay
                setTimeout(() => setFeedback(null), 3000);
            }
        } catch (err) {
            console.error('Exception in handleVerifyEducator:', err);
            alert(`Terjadi kesalahan: ${err.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleBanUser = async (userId, status) => {
        setProcessingId(userId);

        const banned = !status; // if not banned, then ban
        const reason = banned ? prompt('Alasan banned:') : null;

        if (banned && !reason) {
            setProcessingId(null);
            return;
        }

        const { error } = await supabase
            .from('users')
            .update({
                is_banned: banned,
                banned_reason: reason,
                banned_at: banned ? new Date().toISOString() : null
            })
            .eq('id', userId);

        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            setAllUsers(allUsers.map(u =>
                u.id === userId ? { ...u, is_banned: banned, banned_reason: reason } : u
            ));
        }

        setProcessingId(null);
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] flex items-center justify-center p-4">
                <div className="bg-slate-900/50 border border-red-500 rounded-xl p-8 max-w-md text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Akses Ditolak</h2>
                    <p className="text-gray-400 mb-6">
                        Halaman ini hanya untuk admin.
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
                            <div className="p-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-sm text-gray-400">Moderasi & Manajemen</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Feedback Message */}
                {feedback && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fadeIn ${feedback.type === 'success' ? 'bg-green-600/20 border border-green-500 text-green-400' : 'bg-red-600/20 border border-red-500 text-red-400'
                        }`}>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">{feedback.message}</span>
                    </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Flag className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-semibold text-white">Laporan Pending</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-white">Verifikasi Pending</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.pendingEducators}</p>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-white">Total Users</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'reports'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <Flag className="w-5 h-5 inline mr-2" />
                        Laporan ({stats.pendingReports})
                    </button>
                    <button
                        onClick={() => setActiveTab('educators')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'educators'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <CheckCircle className="w-5 h-5 inline mr-2" />
                        Verifikasi Educator ({stats.pendingEducators})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${activeTab === 'users'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                            }`}
                    >
                        <Users className="w-5 h-5 inline mr-2" />
                        Manajemen User
                    </button>
                </div>

                {/* Content */}
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
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                        {activeTab === 'reports' && (
                            <>
                                <h2 className="text-xl font-bold text-white mb-6">Laporan Pending</h2>
                                {reports.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">Tidak ada laporan pending</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {reports.map(report => (
                                            <div
                                                key={report.id}
                                                className="bg-slate-800/50 border border-slate-600 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white mb-1">
                                                            {report.post?.title || 'Post Deleted'}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 mb-2">
                                                            Ticker: {report.post?.ticker} • Category: {report.post?.category}
                                                        </p>
                                                        <p className="text-sm text-yellow-400 mb-2">
                                                            <strong>Alasan:</strong> {report.reason}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Dilaporkan oleh: {report.reporter?.full_name} • {new Date(report.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/education/${report.post_id}`)}
                                                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center gap-2"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Lihat Post
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewReport(report.id, 'approve')}
                                                        disabled={processingId === report.id}
                                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {processingId === report.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4" />
                                                        )}
                                                        Hapus Post
                                                    </button>
                                                    <button
                                                        onClick={() => handleReviewReport(report.id, 'dismiss')}
                                                        disabled={processingId === report.id}
                                                        className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Tolak Laporan
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'educators' && (
                            <>
                                <h2 className="text-xl font-bold text-white mb-6">Verifikasi Educator</h2>
                                {educators.length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-400">Tidak ada educator pending verifikasi</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {educators.map(educator => (
                                            <div
                                                key={educator.educator_id}
                                                className="bg-slate-800/50 border border-slate-600 rounded-lg p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-white mb-1">
                                                            {educator.educator?.full_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-400 mb-2">
                                                            {educator.educator?.email}
                                                        </p>
                                                        <p className="text-sm text-blue-400">
                                                            <strong>Certificate:</strong> {educator.certificate_number}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Mendaftar: {new Date(educator.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleVerifyEducator(educator.educator_id, 'approve')}
                                                        disabled={processingId === educator.educator_id}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {processingId === educator.educator_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                        Verifikasi
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerifyEducator(educator.educator_id, 'reject')}
                                                        disabled={processingId === educator.educator_id}
                                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Tolak
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'users' && (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-xl font-bold text-white">Manajemen User</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari email atau nama..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-700">
                                                <th className="py-4 px-4 text-sm font-semibold text-gray-400">User</th>
                                                <th className="py-4 px-4 text-sm font-semibold text-gray-400">Role</th>
                                                <th className="py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                                                <th className="py-4 px-4 text-sm font-semibold text-gray-400 text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {allUsers
                                                .filter(u =>
                                                    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map(userItem => (
                                                    <tr key={userItem.id} className="hover:bg-slate-800/30 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="font-semibold text-white">{userItem.full_name}</div>
                                                            <div className="text-xs text-gray-500">{userItem.email}</div>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${userItem.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                                userItem.role === 'educator' ? 'bg-purple-500/20 text-purple-400' :
                                                                    'bg-blue-500/20 text-blue-400'
                                                                }`}>
                                                                {userItem.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            {userItem.is_banned ? (
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-red-500 font-medium">Banned</span>
                                                                    <span className="text-[10px] text-gray-500 truncate max-w-[150px]" title={userItem.banned_reason}>
                                                                        {userItem.banned_reason}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-green-500 font-medium">Aktif</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            {userItem.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleBanUser(userItem.id, userItem.is_banned)}
                                                                    disabled={processingId === userItem.id}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${userItem.is_banned
                                                                        ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                                                        : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                                                        }`}
                                                                >
                                                                    {processingId === userItem.id ? 'Loading...' : userItem.is_banned ? 'Unban' : 'Ban'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
