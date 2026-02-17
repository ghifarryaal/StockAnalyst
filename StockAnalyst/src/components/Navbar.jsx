import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Sparkles,
    GraduationCap,
    Building2,
    LogIn,
    User,
    LogOut,
    Key,
    ChevronDown,
    Shield,
    LayoutDashboard,
    BookOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const [showProfileCard, setShowProfileCard] = useState(false);
    const cardRef = useRef(null);

    // Close card when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowProfileCard(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const isAdmin = user?.role === 'admin';
        setShowProfileCard(false);
        await logout();
        if (isAdmin) {
            navigate('/admin/login');
        } else {
            navigate('/login');
        }
    };

    const handleResetPassword = () => {
        setShowProfileCard(false);
        navigate('/forgot-password');
    };

    const isHome = location.pathname === '/';

    return (
        <header className="px-6 py-4 border-b border-gray-700/30 backdrop-blur-xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* LOGO */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-base">
                            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">StockAnalyst</span>
                        </h1>
                        <p className="text-[10px] text-gray-500">by Ghifarryaal</p>
                    </div>
                </div>

                {/* NAVIGATION LINKS (DESKTOP) */}
                <div className="hidden md:flex items-center gap-6 ml-8">
                    <button
                        onClick={() => navigate('/')}
                        className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Analyst AI
                    </button>
                    <button
                        onClick={() => navigate('/education')}
                        className={`text-sm font-medium transition-colors ${location.pathname.startsWith('/education') ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Edukasi
                    </button>
                    <button
                        onClick={() => navigate('/industry-guide')}
                        className={`text-sm font-medium transition-colors ${location.pathname === '/industry-guide' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Industri
                    </button>
                    <button
                        onClick={() => navigate('/glossary')}
                        className={`text-sm font-medium transition-colors ${location.pathname === '/glossary' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Glosarium
                    </button>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-3">
                    {!isAuthenticated ? (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-blue-500/40"
                        >
                            <LogIn size={16} />
                            <span>Login</span>
                        </button>
                    ) : (
                        <div className="relative" ref={cardRef}>
                            {/* Profile Trigger */}
                            <button
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className="flex items-center gap-2 p-1 pr-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-700/50 transition-all duration-200 group"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                    {user?.full_name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-sm font-medium text-gray-200 group-hover:text-white hidden sm:inline">
                                    {user?.full_name?.split(' ')[0] || 'User'}
                                </span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showProfileCard ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Profile Card Dropdown */}
                            {showProfileCard && (
                                <div className="absolute right-0 mt-3 w-72 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn backdrop-blur-2xl bg-opacity-95">
                                    {/* User Info Header */}
                                    <div className="p-5 border-b border-gray-800 bg-gradient-to-br from-gray-800/50 to-transparent">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                {user?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-white truncate">{user?.full_name || 'User'}</h3>
                                                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        {/* Badge for Role */}
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${user?.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                                user?.role === 'educator' ? 'bg-purple-500/20 text-purple-500' :
                                                    'bg-blue-500/20 text-blue-500'
                                                }`}>
                                                {user?.role || 'user'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions List */}
                                    <div className="p-2">
                                        {/* Dashboard access for Admin/Educator */}
                                        {(user?.role === 'admin' || user?.role === 'educator') && (
                                            <button
                                                onClick={() => {
                                                    setShowProfileCard(false);
                                                    navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/educator');
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
                                            >
                                                <LayoutDashboard size={18} className="text-gray-500 group-hover:text-blue-400" />
                                                <span>Dashboard {user.role === 'admin' ? 'Admin' : 'Educator'}</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => {
                                                setShowProfileCard(false);
                                                navigate('/education');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group md:hidden"
                                        >
                                            <GraduationCap size={18} className="text-gray-500 group-hover:text-purple-400" />
                                            <span>Lihat Edukasi</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowProfileCard(false);
                                                navigate('/industry-guide');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group md:hidden"
                                        >
                                            <Building2 size={18} className="text-gray-500 group-hover:text-cyan-400" />
                                            <span>Panduan Industri</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowProfileCard(false);
                                                navigate('/glossary');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group md:hidden"
                                        >
                                            <BookOpen size={18} className="text-gray-500 group-hover:text-green-400" />
                                            <span>Glosarium</span>
                                        </button>

                                        <button
                                            onClick={handleResetPassword}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
                                        >
                                            <Key size={18} className="text-gray-500 group-hover:text-yellow-400" />
                                            <span>Ganti Password</span>
                                        </button>

                                        <div className="my-1 border-t border-gray-800 mx-2"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group"
                                        >
                                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
