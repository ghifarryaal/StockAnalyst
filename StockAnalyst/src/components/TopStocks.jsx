import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const API_BASE = "https://api.indonesiastockanalyst.my.id";
const YAHOO_FINANCE_API = "https://query1.finance.yahoo.com/v1/finance/screener";

// Cache untuk mengurangi API calls (5 menit)
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const TopStocks = ({ onStockClick }) => {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('gainers'); // 'gainers' or 'losers'

  // Fetch top movers dari Yahoo Finance API
  const fetchTopMoversFromYahoo = async () => {
    try {
      // Request for top gainers (high volume, sorted by change DESC)
      const gainersBody = {
        offset: 0,
        size: 50,
        sortField: "percentchange",
        sortType: "DESC",
        quoteType: "EQUITY",
        query: {
          operator: "and",
          operands: [
            { operator: "eq", operands: ["region", "id"] },
            { operator: "gt", operands: ["intradaymarketcap", 100000000] } // Min 100M market cap
          ]
        },
        userId: "",
        userIdType: "guid"
      };

      const gainersResponse = await fetch(YAHOO_FINANCE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gainersBody)
      });

      if (!gainersResponse.ok) throw new Error('Yahoo Finance API failed');

      const gainersData = await gainersResponse.json();
      const quotes = gainersData?.finance?.result?.[0]?.quotes || [];

      if (quotes.length === 0) throw new Error('No data from Yahoo Finance');

      // Process data
      const processedStocks = quotes
        .filter(q => q.symbol && q.symbol.endsWith('.JK') && q.regularMarketChangePercent !== undefined)
        .map(q => ({
          code: q.symbol.replace('.JK', ''),
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice || 0,
          change: q.regularMarketChangePercent || 0,
          volume: q.regularMarketVolume || 0
        }))
        .filter(s => s.volume > 0); // Only stocks with volume

      // Sort by volume to get high volume stocks
      const sortedByVolume = [...processedStocks].sort((a, b) => b.volume - a.volume);
      const highVolumeStocks = sortedByVolume.slice(0, 30); // Top 30 by volume

      // From high volume stocks, get top gainers and losers
      const sortedByChange = [...highVolumeStocks].sort((a, b) => b.change - a.change);

      return {
        gainers: sortedByChange.slice(0, 5),
        losers: sortedByChange.slice(-5).reverse()
      };
    } catch (error) {
      console.error('Yahoo Finance API error:', error);
      throw error;
    }
  };

  // Fallback: fetch from existing API
  const fetchTopMoversFromFallback = async () => {
    try {
      const majorStocks = [
        'BBCA', 'BBRI', 'TLKM', 'ASII', 'BMRI', 'BBNI', 'UNVR', 'ICBP',
        'INDF', 'GGRM', 'KLBF', 'HMSP', 'SMGR', 'INCO', 'ADRO', 'PTBA',
        'ANTM', 'PGAS', 'ITMG', 'UNTR', 'EXCL', 'CPIN', 'TBIG', 'TOWR',
        'MIKA', 'GOTO', 'BUKA', 'EMTK', 'MDKA', 'BRPT', 'TPIA', 'MEDC',
        'JPFA', 'WIKA', 'WSKT', 'PTPP', 'JSMR', 'SSIA', 'WTON', 'SCMA',
        'AMMN', 'ACES', 'ESSA', 'ERAA', 'TKIM', 'BYAN', 'ASSA', 'BRIS',
        'HRUM', 'BUMI', 'DOID', 'ELSA', 'SRTG', 'TINS', 'AKRA', 'MNCN'
      ];

      const promises = majorStocks.map(async (code) => {
        try {
          const symbol = `${code}.JK`;
          const url = `${API_BASE}/api/chart/${symbol}?limit=10`;
          const response = await fetch(url);
          if (!response.ok) return null;

          const json = await response.json();
          const data = json.data || [];

          if (data.length < 2) return null;

          const today = data[data.length - 1];
          const yesterday = data[data.length - 2];

          if (!yesterday?.price || !today?.price) return null;

          const dailyChange = ((today.price - yesterday.price) / yesterday.price) * 100;

          return {
            code: code,
            name: json.info?.shortName || json.info?.longName || json.ticker || code,
            price: today.price,
            change: dailyChange,
            volume: today.volume || 0
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validStocks = results.filter(stock => stock !== null);

      if (validStocks.length === 0) throw new Error('No valid stocks from fallback');

      const sortedByVolume = [...validStocks].sort((a, b) => b.volume - a.volume);
      const highVolumeStocks = sortedByVolume.slice(0, Math.max(10, Math.ceil(sortedByVolume.length * 0.4)));

      const sorted = [...highVolumeStocks].sort((a, b) => b.change - a.change);

      return {
        gainers: sorted.slice(0, 5),
        losers: sorted.slice(-5).reverse()
      };
    } catch (error) {
      console.error('Fallback API error:', error);
      throw error;
    }
  };

  const loadTopStocks = async () => {
    // Check cache
    if (cachedData && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached data');
      setTopGainers(cachedData.gainers);
      setTopLosers(cachedData.losers);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching from Yahoo Finance API...');
      const data = await fetchTopMoversFromYahoo();

      // Cache the data
      cachedData = data;
      cacheTimestamp = Date.now();

      setTopGainers(data.gainers);
      setTopLosers(data.losers);
    } catch (yahooError) {
      console.log('Yahoo Finance failed, using fallback API...');
      try {
        const data = await fetchTopMoversFromFallback();

        // Cache the fallback data
        cachedData = data;
        cacheTimestamp = Date.now();

        setTopGainers(data.gainers);
        setTopLosers(data.losers);
      } catch (fallbackError) {
        console.error('All APIs failed:', fallbackError);
        setError('Failed to load stock data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTopStocks();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadTopStocks();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

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
      `https://img.id.my/logo/${code}`, // Fallback tambahan
    ];

    return {
      logoSources,
      initial: code.substring(0, 2),
      gradient: colors[colorIndex]
    };
  };

  const StockItem = ({ stock }) => {
    const logo = getStockLogo(stock.code);
    const [currentLogoIndex, setCurrentLogoIndex] = React.useState(0);
    const [logoError, setLogoError] = React.useState(false);

    const handleLogoError = () => {
      // Try next logo source
      if (currentLogoIndex < logo.logoSources.length - 1) {
        setCurrentLogoIndex(currentLogoIndex + 1);
        setLogoError(false);
      } else {
        setLogoError(true);
      }
    };

    return (
      <button
        onClick={() => onStockClick && onStockClick(stock.code)}
        className="w-full p-1.5 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/40 rounded-lg hover:border-blue-500/30 hover:scale-[1.01] transition-all duration-300 group"
      >
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${logo.gradient} flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden`}>
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

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-0.5">
              <p className="text-xs font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
                {stock.code}
              </p>
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold flex-shrink-0 shadow-sm ${stock.change >= 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                }`}>
                {stock.change >= 0 ? (
                  <TrendingUp size={8} strokeWidth={2.5} />
                ) : (
                  <TrendingDown size={8} strokeWidth={2.5} />
                )}
                <span>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <p className="text-[8px] text-gray-400 line-clamp-1 leading-tight mt-0.5">
              {stock.name}
            </p>
            <p className="text-[13px] font-semibold text-white mt-0.5">
              {formatPrice(stock.price)}
            </p>
          </div>
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-l border-gray-700/30">
        <Loader2 className="animate-spin text-blue-400" size={24} />
      </div>
    );
  }

  const GainersList = () => (
    <div className="flex-1 overflow-y-auto border-r border-gray-700/30 custom-scrollbar">
      <div className="sticky top-0 p-3 border-b border-gray-700/30 bg-gradient-to-r from-green-900/20 to-green-900/10 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg">
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-xs bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Top Gainers
            </h2>
            <p className="text-[8px] text-gray-500">High Volume</p>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-1">
        {topGainers.map((stock, idx) => (
          <StockItem key={`gainer-${stock.code}-${idx}`} stock={stock} />
        ))}
      </div>
    </div>
  );

  const LosersList = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="sticky top-0 p-3 border-b border-gray-700/30 bg-gradient-to-r from-red-900/20 to-red-900/10 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg shadow-lg">
            <TrendingDown className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-xs bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Top Losers
            </h2>
            <p className="text-[8px] text-gray-500">High Volume</p>
          </div>
        </div>
      </div>
      <div className="p-2 space-y-1">
        {topLosers.map((stock, idx) => (
          <StockItem key={`loser-${stock.code}-${idx}`} stock={stock} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gradient-to-b from-gray-900/50 to-gray-900/30 backdrop-blur-sm border-l border-gray-700/30 overflow-hidden">
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-gray-700/30">
        <button
          onClick={() => setActiveTab('gainers')}
          className={`flex-1 py-3 text-xs font-bold transition-all ${activeTab === 'gainers'
            ? 'bg-green-500/10 text-green-400 border-b-2 border-green-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          Top Gainers
        </button>
        <button
          onClick={() => setActiveTab('losers')}
          className={`flex-1 py-3 text-xs font-bold transition-all ${activeTab === 'losers'
            ? 'bg-red-500/10 text-red-400 border-b-2 border-red-500'
            : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          Top Losers
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Desktop: Show Both */}
        <div className="hidden lg:flex flex-1 h-full">
          <GainersList />
          <LosersList />
        </div>

        {/* Mobile: Show Active Tab */}
        <div className="lg:hidden flex-1 h-full overflow-hidden flex flex-col">
          {activeTab === 'gainers' ? <GainersList /> : <LosersList />}
        </div>
      </div>
    </div>
  );
};

export default TopStocks;
