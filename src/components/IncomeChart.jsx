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

const formatByUnit = (num, unit) => {
  if (!num) return "-";

  if (unit === "T") return (num / 1e12).toFixed(2) + " T";
  if (unit === "B") return (num / 1e9).toFixed(2) + " B";

  // AUTO
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " Jt";

  return num.toLocaleString("id-ID");
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="bg-[#0B1221] border border-gray-700 p-3 rounded-lg text-sm">
      <p className="font-semibold mb-2 text-gray-200">
        {label}
      </p>

      <p className="text-purple-400">
        Revenue : {formatByUnit(d.revenue, unit)}
      </p>

      <p className="text-blue-400">
        Net Income : {formatByUnit(d.net_income, unit)}
      </p>

      <p className="text-emerald-400">
        Net Margin : {d.net_margin?.toFixed(2)}%
      </p>
    </div>
  );
};

const FundamentalChart = ({ symbol }) => {
  const [data, setData] = useState([]);
  const [score, setScore] = useState(null);
  const [unit, setUnit] = useState("AUTO"); // AUTO | B | T
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
          `${API_BASE}/api/chart/fundamental/${ticker}`
        );

        if (!res.ok) throw new Error("API Error");

        const json = await res.json();

        setData(json.chart);
        setScore(json.score);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">
          Income Statement
        </h3>

        {score && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold
              ${score.verdict === "SEHAT"
                ? "bg-emerald-600/20 text-emerald-400"
                : score.verdict === "NETRAL"
                  ? "bg-yellow-600/20 text-yellow-400"
                  : "bg-red-600/20 text-red-400"
              }`}
          >
            {score.verdict} ({score.score})
          </span>
        )}
      </div>

      {/* TOGGLE */}
      <div className="flex gap-2 mb-3">
        {["AUTO", "B", "T"].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold
              ${unit === u
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
              }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* CHART */}
      <div className="h-[320px]">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis dataKey="date" />

            <YAxis
              tickFormatter={(v) => formatByUnit(v, unit)}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 40]}
              tickFormatter={(v) => v + "%"}
            />

            <Tooltip
              content={
                <CustomTooltip unit={unit} />
              }
            />

            <Legend />

            <Bar
              dataKey="revenue"
              fill="#7c3aed"
              name="Revenue"
            />

            <Bar
              dataKey="net_income"
              fill="#3b82f6"
              name="Net Income"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="net_margin"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Net Margin"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* NOTES */}
      {score && (
        <div className="mt-4 space-y-1 text-sm text-gray-400">
          {score.notes.map((n, i) => (
            <p key={i}>• {n}</p>
          ))}
        </div>
      )}

    </div>
  );
};

export default FundamentalChart;
