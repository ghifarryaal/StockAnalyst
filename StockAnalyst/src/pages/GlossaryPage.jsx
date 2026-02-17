import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import Glossary from "../components/Glossary";
import Navbar from "../components/Navbar";

const GlossaryPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#1a1f2e] to-[#0f1117] text-gray-100">
            <Navbar />

            {/* Sub-Header */}
            <div className="bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
                        <BookOpen className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Glosarium Saham</h1>
                        <p className="text-sm text-gray-400">Kamus istilah investasi saham untuk pemula hingga profesional</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                <Glossary standalone={true} />
            </div>
        </div>
    );
};

export default GlossaryPage;
