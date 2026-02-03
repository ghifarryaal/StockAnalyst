import React, { useEffect, useState, memo } from "react";
import {
  ResponsiveContainer, ComposedChart,
  Bar, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import {
  formatNumber,
  formatQuarter,
  scoreColor
} from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const IncomeChart = ({ symbol }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    fetch(`${API_BASE}/api/chart/fundamental/${t}?limit=10`)
      .then(r => r.json())
      .then(setJson);
  }, [symbol]);

  if (!json)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Income Statement
      </h3>

      <div className="h-[340px]">
        <ResponsiveContainer>
          <ComposedChart data={json.chart}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={formatQuarter}
              tick={{ fill: "#fff" }}
            />

            <YAxis
              yAxisId="left"
              tickFormatter={formatNumber}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => v + " %"}
            />

            {/* TOOLTIP QUARTER */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="bg-white text-black p-3 rounded shadow text-sm">
                    {/* HITAM */}
                    <p className="font-semibold mb-1 text-black">
                      {formatQuarter(label)}
                    </p>

                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }}>
                        {p.name} :
                        {" "}
                        {p.dataKey === "net_margin"
                          ? p.value + " %"
                          : formatNumber(p.value)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              yAxisId="left"
              dataKey="revenue"
              fill="#6D28D9"
              name="Revenue"
            />

            <Bar
              yAxisId="left"
              dataKey="net_income"
              fill="#3B82F6"
              name="Net Income"
            />

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="net_margin"
              stroke="#5EEAD4"
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Net Margin"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* SCORE */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded">
        <span className={`
          inline-block px-3 py-1 rounded-full
          text-sm font-bold
          ${scoreColor(json.score.verdict)}
        `}>
          Skor {json.score.score} - {json.score.verdict}
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

export default memo(IncomeChart);
