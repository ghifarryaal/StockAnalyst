import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar
} from 'recharts';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';

const CACHE = {};
const API_BASE = "https://api.indonesiastockanalyst.my.id";

const normalizeTicker = (s) => {
  if (!s) return "";
  s = s.toUpperCase();
  if (s.length === 4 && !s.endsWith(".JK")) return `${s}.JK`;
  return s;
};

// ===== SAFE DATE FORMAT =====
const safeFormatDate = (d, fmt = "dd MMM yyyy") => {
  try {
    if (!d) return "-";
    return format(new Date(d), fmt);
  } catch {
    return d;
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-[#0B1221] border border-gray-700 p-3 rounded-lg shadow-xl text-sm">
      <p className="text-gray-300 font-semibold mb-1">
        {safeFormatDate(label)}
      </p>

      <p className="text-blue-400">EMA 20 : {d.ema20?.toFixed(2) ?? "-"}</p>
      <p className="text-purple-400">EMA 50 : {d.ema50?.toFixed(2) ?? "-"}</p>
      <p className="text-emerald-400">Price : {d.price?.toFixed(2) ?? "-"}</p>

      <hr className="my-2 border-gray-700" />

      <p>Open : {d.open ?? "-"}</p>
      <p>High : {d.high ?? "-"}</p>
      <p>Low : {d.low ?? "-"}</p>
      <p>Close : {d.close ?? d.price ?? "-"}</p>

      <p className="mt-1 text-gray-400">
        Volume : {d.volume?.toLocaleString() ?? "-"}
      </p>
    </div>
  );
};

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);
  const [meta, setMeta] = useState({
    syariah: false,
    suspend: false,
    ticker: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const controller = new AbortController();
    const ticker = normalizeTicker(symbol);

    const fetchData = async () => {
      try {
        setError(null);

        if (CACHE[ticker]) {
          const cached = CACHE[ticker];
          setChartData(cached.data);
          setMeta(cached.meta);
          return;
        }

        setLoading(true);

        const res = await fetch(
          `${API_BASE}/api/chart/${ticker}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error("API Error");

        const json = await res.json();

        const metaInfo = {
          ticker: json.ticker,
          syariah: json.syariah,
          suspend: json.suspend
        };

        CACHE[ticker] = {
          data: json.data,
          meta: metaInfo
        };

        setChartData(json.data);
        setMeta(metaInfo);

      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [symbol]);

  const last = chartData.at(-1);
  const first = chartData[0];

  const pct = first
    ? ((last?.price - first?.price) / first?.price) * 100
    : 0;

  const isUp = pct >= 0;

  if (loading)
    return (
      <div className="h-[420px] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="h-[420px] flex items-center justify-center text-red-400">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );

  return (
    <div className="bg-[#0B1221] p-6 rounded-xl border border-gray-800">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">
          {meta.ticker || normalizeTicker(symbol)}
        </h3>

        <div className="flex gap-2">
          {/* SYARIAH BADGE */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold
            ${meta.syariah
              ? "bg-emerald-600/20 text-emerald-400"
              : "bg-gray-600/20 text-gray-300"
            }`}
          >
            {meta.syariah ? "SYARIAH" : "NON SYARIAH"}
          </span>

          {/* SUSPEND BADGE */}
          {meta.suspend && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold
              bg-red-600/20 text-red-400">
              SUSPEND
            </span>
          )}
        </div>
      </div>

      {/* PRICE */}
      <div className="flex items-center gap-3 mt-3">
        <p className="text-3xl font-bold">
          Rp {last?.price?.toLocaleString("id-ID") ?? "-"}
        </p>

        {!meta.suspend && (
          <span
            className={`px-3 py-1 rounded-full text-sm
            ${isUp
              ? "bg-emerald-600/20 text-emerald-400"
              : "bg-red-600/20 text-red-400"
            }`}
          >
            {isUp ? "+" : ""}
            {pct.toFixed(2)}%
          </span>
        )}
      </div>

      <p className="text-gray-500 text-sm mt-1">
        {safeFormatDate(first?.date)}
        {" "} - {" "}
        {safeFormatDate(last?.date)}
      </p>

      {/* SUSPEND MESSAGE */}
      {meta.suspend && (
        <div className="mt-4 bg-red-900/20 border border-red-700 text-red-400 p-3 rounded-lg text-sm">
          ⚠ Saham ini sedang SUSPEND / tidak aktif diperdagangkan
        </div>
      )}

      {/* PRICE CHART */}
      {!meta.suspend && (
        <>
          <div className="h-[300px] mt-4">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(d) =>
                    safeFormatDate(d, "dd MMM")
                  }
                />

                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Line dataKey="ema20" stroke="#3b82f6" dot={false} />
                <Line dataKey="ema50" stroke="#a855f7" dot={false} />
                <Line dataKey="price" stroke="#10b981" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* VOLUME */}
          <div className="h-[120px] mt-6">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

    </div>
  );
};

export default StockChart;
