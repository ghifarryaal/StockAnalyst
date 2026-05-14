import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Loading Indicator Component
 * Shows different states: checking cache, fetching data, analyzing
 */
export default function LoadingIndicator({ status = 'analyzing', cacheAge = null }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'checking_cache':
                return {
                    icon: '🔍',
                    title: 'Memeriksa Cache...',
                    subtitle: 'Mencari data tersimpan',
                    color: 'from-cyan-600/10 to-blue-600/10',
                    borderColor: 'border-cyan-500/20'
                };
            case 'cache_hit':
                return {
                    icon: '⚡',
                    title: 'Menggunakan Data Cache',
                    subtitle: cacheAge ? `Data ${cacheAge} menit yang lalu` : 'Data tersimpan',
                    color: 'from-green-600/10 to-emerald-600/10',
                    borderColor: 'border-green-500/20'
                };
            case 'fetching':
                return {
                    icon: '🌐',
                    title: 'Mengambil Data Terbaru...',
                    subtitle: 'Menghubungi server analisis',
                    color: 'from-orange-600/10 to-yellow-600/10',
                    borderColor: 'border-orange-500/20'
                };
            case 'analyzing':
            default:
                return {
                    icon: '🤖',
                    title: 'Memproses AI...',
                    subtitle: 'Menganalisis data pasar',
                    color: 'from-blue-600/10 to-purple-600/10',
                    borderColor: 'border-blue-500/20'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`max-w-3xl mx-auto px-4 mt-4 flex items-center gap-3 bg-gradient-to-r ${config.color} border ${config.borderColor} rounded-xl p-4 backdrop-blur-sm animate-fadeIn`}>
            <Loader2 className="animate-spin text-blue-400 flex-shrink-0" size={20} />
            <div className="flex flex-col flex-1">
                <span className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <span>{config.icon}</span>
                    {config.title}
                </span>
                <span className="text-xs text-gray-400">{config.subtitle}</span>
            </div>
            <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    );
}

/**
 * Skeleton Loading for Chart
 */
export function ChartSkeleton() {
    return (
        <div className="max-w-3xl mx-auto px-4 mt-4 animate-pulse">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-64 bg-gray-700/50 rounded mb-4"></div>
                <div className="flex gap-2">
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                    <div className="h-8 bg-gray-700 rounded w-20"></div>
                </div>
            </div>
        </div>
    );
}
