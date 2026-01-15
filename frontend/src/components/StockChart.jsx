import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';

// ===== FRONT CACHE =====
const CACHE = {};

const StockChart = ({ symbol }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      try {
        setError(null);

        // ⚡ CACHE HIT
        if (CACHE[symbol]) {
          console.log("[CACHE HIT]", symbol);
          setChartData(CACHE[symbol]);
          return;
        }

        setLoading(true);

        const res = await fetch(
          `http://localhost:8000/api/stocks/${symbol}`
        );

        if (!res.ok) {
          throw new Error(`Gagal ambil data (${res.status})`);
        }

        const json = await res.json();

        if (!json.data || json.data.length === 0) {
          throw new Error("Data saham kosong");
        }

        // SAVE CACHE
        CACHE[symbol] = json.data;

        setChartData(json.data);

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  const formatDate = (iso) =>
    format(new Date(iso), 'MMM dd');

  // ===== LOADING STATE =====
  if (loading)
    return (
      <div className="w-full h-[400px] bg-[#0B1221] rounded-xl flex flex-col
                      items-center justify-center border border-gray-800 mt-6 text-gray-400">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
        <span>Mengambil data {symbol}...</span>
      </div>
    );

  // ===== ERROR STATE =====
  if (error)
    return (
      <div className="w-full h-[400px] bg-[#0B1221] rounded-xl flex flex-col
                      items-center justify-center border border-red-900/50 mt-6 text-red-400">
        <AlertCircle className="h-8 w-8 mb-2" />
        <span>Error: {error}</span>
      </div>
    );

  // ===== MAIN UI =====
  return (
    <div className="w-full bg-[#0B1221] p-6 rounded-xl
                    border border-gray-800 shadow-2xl mt-6">

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h3 className="text-white text-lg font-semibold">
            Analisis {symbol}
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            1 Year • EMA 20 & 50
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">
            {chartData.at(-1)?.price?.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ===== FIX HEIGHT BUG ===== */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#475569"
            />

            <YAxis stroke="#475569" />

            <Tooltip />
            <Legend />

            <Line
              name="EMA 20"
              type="monotone"
              dataKey="ema20"
              stroke="#3b82f6"
              dot={false}
            />

            <Line
              name="EMA 50"
              type="monotone"
              dataKey="ema50"
              stroke="#a855f7"
              dot={false}
            />

            <Line
              name="Price"
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;
