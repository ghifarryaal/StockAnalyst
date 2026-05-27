import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Navbar = ({ onOpenGlossary, onOpenIndustryGuide, extraActions }) => {
    const navigate = useNavigate();
    const location = useLocation();

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
                        onClick={() => onOpenIndustryGuide ? onOpenIndustryGuide() : navigate('/industry-guide')}
                        className={`text-sm font-medium transition-colors ${location.pathname === '/industry-guide' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Industri
                    </button>
                    <button
                        onClick={() => onOpenGlossary ? onOpenGlossary() : navigate('/glossary')}
                        className={`text-sm font-medium transition-colors ${location.pathname === '/glossary' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        Glosarium
                    </button>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex items-center gap-3">
                    {extraActions}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
