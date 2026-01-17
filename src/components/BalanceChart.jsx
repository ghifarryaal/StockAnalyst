import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart, Bar,
  Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2, AlertCircle } from "lucide-react";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const normalizeTicker = (s) => {
  if (!s) return "";
  s = s.toUpperCase();
  if (s.length === 4 && !s.endsWith(".JK")) return `${s}.JK`;
  return s;
};

// ===== FORMAT NUMBER =====
const formatByUnit = (num) => {
  if (num === null || num === undefined) return "-";

  if (num >= 1e12) return (num / 1e12).toFixed(2) + " T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " Jt";

  return num.toLocaleString("id-ID");
};

const BalanceChart = ({ symbol }) => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const ticker = normalizeTicker(symbol);

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `${API_BASE}/api/chart/balance/${ticker}`
        );

        if (!res.ok)
          throw new Error("API Error");

        const json = await res.json();

        setData(json.chart || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // ===== LOADING =====
  if (loading)
    return (
      <div className="h-[380px] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );

  // ===== ERROR =====
  if (error)
    return (
      <div className="h-[380px] flex items-center justify-center text-red-400">
        <AlertCircle className="mr-2" /> {error}
      </div>
    );

  return (
    <div className="bg-[#0B1221] p-6 rounded-xl border border-gray-800">

      {/* HEADER */}
      <h3 className="text-white font-semibold mb-4">
        Neraca (Balance Sheet)
      </h3>

      {/* CHART */}
      <div className="h-[300px]">
        <ResponsiveContainer>

          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
            />

            <XAxis dataKey="date" />

            <YAxis
              tickFormatter={(v) => formatByUnit(v)}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[-1, 2]}
              tickFormatter={(v) => v}
            />

            <Tooltip
              formatter={(v) => formatByUnit(v)}
            />

            <Legend />

            {/* TOTAL ASSETS */}
            <Bar
              dataKey="total_assets"
              fill="#7c3aed"
              name="Total Assets"
            />

            {/* TOTAL LIABILITIES */}
            <Bar
              dataKey="total_liabilities"
              fill="#3b82f6"
              name="Total Liabilities"
            />

            {/* DEBT EQUITY RATIO */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="de_ratio"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Debt Equity Ratio"
            />

          </BarChart>

        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default BalanceChart;
