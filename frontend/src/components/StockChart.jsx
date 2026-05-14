import React, { useState, useEffect, memo } from 'react';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  BarChart, Bar, Cell
} from 'recharts';
import { Loader2, CandlestickChart as CandleIcon, TrendingUp } from 'lucide-react';
import { formatNumber } from "./utils";
import CandlestickChart from './CandlestickChart';
import { getStockIndustry } from './stockIndustryData';

const API_BASE = "https://api.indonesiastockanalyst.my.id";

/* ================= MARKET CAP ================= */

const formatMarketCap = (n) => {
  if (!n) return "-";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " Jt";
  return n.toLocaleString("id-ID");
};

const classifyMarketCap = (n) => {
  if (!n) return null;

  if (n >= 10e12) {
    return {
      label: "BIG CAP",
      desc: "Blue Chip",
      color: "bg-emerald-500/20 text-emerald-400"
    };
  }

  if (n >= 500e9) {
    return {
      label: "MID CAP",
      desc: "Second Liner",
      color: "bg-yellow-500/20 text-yellow-400"
    };
  }

  return {
    label: "SMALL CAP",
    desc: "Third Liner",
    color: "bg-red-500/20 text-red-400"
  };
};

/* ================= DATE ================= */

const safeDate = (d, type = "axis") => {
  try {
    const date = new Date(d);
    if (isNaN(date)) return d;

    if (type === "tooltip") {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    return date.toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric"
    });
  } catch {
    return d;
  }
};

/* ================= COMPONENT ================= */

const StockChart = ({ symbol }) => {
  const [json, setJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line' or 'candlestick'

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/chart/${t}?limit=120`
        );
        if (!res.ok) throw new Error("API Error");

        setJson(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [symbol]);

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  if (error)
    return (
      <p className="text-red-400 text-center mt-10">
        {error}
      </p>
    );

  if (!json) return null;

  const data = json.data || [];
  if (!data.length) return null;

  const first = data[0];
  const last = data[data.length - 1];

  let pct = 0;
  if (first?.price && last?.price)
    pct = ((last.price - first.price) / first.price) * 100;

  const isUp = pct >= 0;

  const mc = classifyMarketCap(json.market_cap);
  const industryInfo = getStockIndustry(symbol);

  return (
    <div>

      {/* HEADER */}
      <div className="mb-3">
        <h3 className="font-semibold text-lg">
          {json.ticker}
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">

          {/* INDUSTRY */}
          {industryInfo && (
            <span className={`
              px-3 py-1 text-xs rounded-full
              font-semibold border
              ${industryInfo.color}
            `}>
              <span className="mr-1">{industryInfo.icon}</span>
              {industryInfo.industry} • {industryInfo.sector}
            </span>
          )}

          {/* SYARIAH */}
          {json.syariah && (
            <span className="
              px-3 py-1 text-xs rounded-full
              bg-emerald-500/20 text-emerald-400
              font-semibold">
              SYARIAH
            </span>
          )}

          {/* MARKET CAP */}
          {mc && (
            <span className={`
              px-3 py-1 text-xs rounded-full
              font-semibold
              ${mc.color}
            `}>
              {mc.label} ({mc.desc})
              {" "}•{" "}
              {formatMarketCap(json.market_cap)}
            </span>
          )}

        </div>
      </div>

      <p className="text-3xl font-bold">
        Rp {last?.price?.toLocaleString("id-ID")}
      </p>

      {/* PERSENTASE */}
      <span className={`
        inline-flex items-center
        px-3 py-1 mt-2 text-sm font-semibold
        rounded-full
        ${isUp
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-red-500/20 text-red-400"}
      `}>
        {isUp ? "▲" : "▼"} {pct.toFixed(2)}%
      </span>

      {/* ================= PRICE ================= */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-400">Price Chart</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              chartType === 'line'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <TrendingUp size={14} />
            Line
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              chartType === 'candlestick'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <CandleIcon size={14} />
            Candle
          </button>
        </div>
      </div>

      <div className="h-[400px] mt-6">
        {chartType === 'line' ? (
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => safeDate(v, "axis")}
              tick={{ fill: "#fff", fontWeight: 600 }}
            />

            <YAxis />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const d = payload[0].payload;

                return (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white p-4 rounded-xl shadow-2xl text-xs backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <p className="font-bold text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {safeDate(label, "tooltip")}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-800/50 rounded-lg p-2">
                          <p className="text-gray-500 text-[10px] mb-0.5">Open</p>
                          <p className="font-bold text-white">{d.open?.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2">
                          <p className="text-gray-500 text-[10px] mb-0.5">Close</p>
                          <p className="font-bold text-white">{d.close?.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-900/20 rounded-lg p-2">
                          <p className="text-green-500 text-[10px] mb-0.5">High</p>
                          <p className="font-bold text-green-400">{d.high?.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-900/20 rounded-lg p-2">
                          <p className="text-red-500 text-[10px] mb-0.5">Low</p>
                          <p className="font-bold text-red-400">{d.low?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
                            <span className="text-gray-400">Price</span>
                          </div>
                          <span className="font-bold text-emerald-400">{d.price?.toLocaleString()}</span>
                        </div>
                        {d.ema20 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-0.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded"></div>
                              <span className="text-gray-400">EMA 20</span>
                            </div>
                            <span className="font-bold text-blue-400">{d.ema20?.toLocaleString()}</span>
                          </div>
                        )}
                        {d.ema50 && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-0.5 bg-gradient-to-r from-purple-600 to-purple-500 rounded"></div>
                              <span className="text-gray-400">EMA 50</span>
                            </div>
                            <span className="font-bold text-purple-400">{d.ema50?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Legend />

            <Line
              dataKey="ema20"
              stroke="#3b82f6"
              dot={false}
              name="EMA 20"
            />

            <Line
              dataKey="ema50"
              stroke="#a855f7"
              dot={false}
              name="EMA 50"
            />

            <Line
              dataKey="price"
              stroke="#10b981"
              dot={false}
              name="Price"
            />
          </LineChart>
        </ResponsiveContainer>
        ) : (
        <CandlestickChart data={data} safeDate={safeDate} />
      )}
      </div>

      {/* ================= VOLUME ================= */}
      <div className="h-[160px] mt-6">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={(v) => safeDate(v, "axis")}
              tick={{ fill: "#fff", fontWeight: 600 }}
            />

            <YAxis tickFormatter={formatNumber} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const d = payload[0]?.payload;
                const isGreen = d?.close >= d?.open;
                const color = isGreen ? '#10b981' : '#ef4444';

                return (
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 text-white p-4 rounded-xl shadow-2xl text-xs backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                      <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: color }}></div>
                      <p className="font-bold text-sm" style={{ color }}>
                        {safeDate(label, "tooltip")} - {isGreen ? 'BULLISH' : 'BEARISH'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center gap-3 bg-gray-800/50 rounded-lg p-2">
                        <span className="text-gray-400">Volume</span>
                        <span className="font-bold">{formatNumber(payload[0].value)}</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              dataKey="volume"
              name="Volume"
            >
              {data.map((entry, index) => {
                const isGreen = entry.close >= entry.open;
                const color = isGreen ? '#10b981' : '#ef4444';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default memo(StockChart);
