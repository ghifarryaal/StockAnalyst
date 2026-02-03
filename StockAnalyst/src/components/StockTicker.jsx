import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const StockTicker = ({ currentTicker, onTickerClick }) => {
  const [stocksData, setStocksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Daftar saham populer Indonesia
  const stockCodes = ['CUAN', 'DEWA', 'BUMI', 'ARCI', 'ANTM', 'BULL', 'SMRA', 'ENRG', 'OASA', 'COIN'];

  const fetchStockData = async (code) => {
    try {
      const symbol = `${code}.JK`;
      const url = `${API_BASE}/api/chart/${symbol}?limit=10`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      const json = await response.json();

      const data = json.data || [];
      if (data.length < 2) {
        return null;
      }

      const today = data[data.length - 1];
      const yesterday = data[data.length - 2];

      if (!yesterday?.price || !today?.price) {
        return null;
      }

      const dailyChange = ((today.price - yesterday.price) / yesterday.price) * 100;

      return {
        code: code,
        name: json.info?.shortName || json.info?.longName || json.ticker || code,
        price: today.price,
        change: dailyChange,
        timestamp: today.date
      };
    } catch (error) {
      console.error(`Error fetching ${code}:`, error);
      return null;
    }
  };

  const loadAllStocks = async () => {
    setIsLoading(true);
    const promises = stockCodes.map(code => fetchStockData(code));
    const results = await Promise.all(promises);
    const validStocks = results.filter(stock => stock !== null);
    setStocksData(validStocks);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllStocks();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollContainerRef.current || isPaused || stocksData.length === 0) return;

    const container = scrollContainerRef.current;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;

        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
        }

        container.scrollLeft = scrollPosition;
      }
      requestAnimationFrame(scroll);
    };

    const animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPaused, stocksData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStockLogo = (code) => {
    const colors = [
      'from-blue-600 to-cyan-600',
      'from-purple-600 to-pink-600',
      'from-green-600 to-emerald-600',
      'from-orange-600 to-red-600',
      'from-indigo-600 to-purple-600',
    ];
    const colorIndex = code.charCodeAt(0) % colors.length;

    // Custom logo overrides for specific tickers (Multiple sources for fallback)
    const customLogos = {
      'CUAN': [
        'https://logo.clearbit.com/petrindo.co.id',
        'https://www.google.com/s2/favicons?domain=petrindo.co.id&sz=128',
        'https://icons.duckduckgo.com/ip3/petrindo.co.id.ico'
      ],
      'INET': [
        'https://logo.clearbit.com/ptsml.id',
        'https://www.google.com/s2/favicons?domain=ptsml.id&sz=128',
        'https://icons.duckduckgo.com/ip3/ptsml.id.ico'
      ],
      'SMRA': [
        'https://logo.clearbit.com/summarecon.com',
        'https://www.google.com/s2/favicons?domain=summarecon.com&sz=128',
        'https://icons.duckduckgo.com/ip3/summarecon.com.ico'
      ],
      'COIN': [
        'https://logo.clearbit.com/indokriptokoinsemesta.co.id',
        'https://www.google.com/s2/favicons?domain=indokriptokoinsemesta.co.id&sz=128',
        'https://icons.duckduckgo.com/ip3/indokriptokoinsemesta.co.id.ico'
      ],
    };

    // Multiple free logo API sources with automatic fallback
    const logoSources = [
      ...(customLogos[code] || []), // Use all custom sources if available
      `https://financialmodelingprep.com/image-stock/${code}.JK.png`,
      `https://assets.parqet.com/logos/symbol/${code}.JK`,
      `https://eodhd.com/img/logos/ID/${code}.JK.png`,
      `https://img.id.my/logo/${code}`,
    ];

    return {
      logoSources,
      initial: code.substring(0, 2),
      gradient: colors[colorIndex]
    };
  };

  // Stock ticker item component with logo fallback
  const StockTickerItem = ({ stock, isActive }) => {
    const logo = getStockLogo(stock.code);
    const [currentLogoIndex, setCurrentLogoIndex] = useState(0);
    const [logoError, setLogoError] = useState(false);

    const handleLogoError = () => {
      if (currentLogoIndex < logo.logoSources.length - 1) {
        setCurrentLogoIndex(currentLogoIndex + 1);
        setLogoError(false);
      } else {
        setLogoError(true);
      }
    };

    return (
      <button
        onClick={() => onTickerClick && onTickerClick(stock.code)}
        className={`flex-shrink-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border rounded-lg px-3 py-1.5 hover:scale-105 transition-all duration-300 hover:shadow-lg group min-w-[140px] relative overflow-hidden ${isActive
          ? 'border-blue-500/50 shadow-blue-500/30 shadow-md'
          : 'border-gray-700/30 hover:border-blue-500/30'
          }`}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
        )}

        <div className="flex items-center gap-2 relative z-10">
          {/* Logo */}
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${logo.gradient} flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden`}>
            {!logoError && currentLogoIndex < logo.logoSources.length ? (
              <img
                key={currentLogoIndex}
                src={logo.logoSources[currentLogoIndex]}
                alt={stock.code}
                className="w-full h-full object-contain bg-white p-1"
                onError={handleLogoError}
              />
            ) : (
              <span className="text-white font-bold text-[10px]">
                {logo.initial}
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-xs font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                {stock.code}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold shadow-lg transition-all duration-300 ${stock.change >= 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/50'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-500/50'
                }`}>
                {stock.change >= 0 ? (
                  <TrendingUp size={12} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={12} strokeWidth={2.5} />
                )}
                <span className="font-bold">
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-1 w-full">
              <span className="text-sm font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {formatPrice(stock.price)}
              </span>
            </div>

            <span className="text-[9px] text-gray-500 truncate max-w-full">
              {stock.name.length > 15 ? stock.name.substring(0, 15) + '...' : stock.name}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="border-b border-gray-700/30 bg-gradient-to-r from-gray-900/40 to-gray-800/40 backdrop-blur-md overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 pointer-events-none"></div>

      <div className="relative z-10 py-2">
        <div className="max-w-7xl mx-auto px-4 mb-1.5">
          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
            Live Market
          </h3>
        </div>

        {isLoading && stocksData.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <RefreshCw size={14} className="animate-spin" />
              <span>Loading stocks...</span>
            </div>
          </div>
        ) : stocksData.length === 0 ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-400 text-xs">
              No stock data available
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-2 overflow-x-hidden px-4"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Duplicate untuk seamless loop */}
            {[...stocksData, ...stocksData].map((stock, index) => (
              <StockTickerItem
                key={`${stock.code}-${index}`}
                stock={stock}
                isActive={currentTicker === stock.code}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default StockTicker;
