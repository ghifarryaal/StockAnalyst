import React, { useEffect, useState, memo } from "react";
import {
  ResponsiveContainer, ComposedChart,
  Bar, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import { formatNumber, formatDate, scoreColor } from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const BalanceChart = ({ symbol }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    fetch(`${API_BASE}/api/chart/balance/${t}?limit=10`)
      .then(r => r.json())
      .then(setJson);
  }, [symbol]);

  if (!json)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Balance Sheet
      </h3>

      <div className="h-[340px]">
        <ResponsiveContainer>
          <ComposedChart data={json.chart}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#fff" }}
            />

            <YAxis
              yAxisId="left"
              tickFormatter={formatNumber}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
            />

            <Tooltip
              formatter={(v, k) =>
                k === "debt_equity_ratio"
                  ? v.toFixed(2)
                  : formatNumber(v)
              }
              labelFormatter={formatDate}
            />

            <Legend />

            <Bar
              yAxisId="left"
              dataKey="total_assets"
              fill="#6D28D9"
              name="Total Assets"
            />

            <Bar
              yAxisId="left"
              dataKey="total_liabilities"
              fill="#3B82F6"
              name="Total Liabilities"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="debt_equity_ratio"
              stroke="#5EEAD4"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="DER"
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* SCORE */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded">
        <span className={`
          inline-block px-3 py-1 rounded-full
          text-sm font-bold
          ${scoreColor(json.score.status)}
        `}>
          Skor {json.score.score} - {json.score.status}
        </span>

        <ul className="list-disc ml-5 mt-3 text-sm">
          {json.score.notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default memo(BalanceChart);
