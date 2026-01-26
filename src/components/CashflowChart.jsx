import React, { useEffect, useState, memo } from "react";
import {
  ResponsiveContainer, BarChart,
  Bar, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid
} from "recharts";
import { Loader2 } from "lucide-react";
import {
  formatNumber,
  formatQuarter,
  scoreColor
} from "./utils";

const API_BASE = "https://api.indonesiastockanalyst.my.id";

const CashflowChart = ({ symbol }) => {
  const [json, setJson] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const t = symbol.length === 4 ? symbol + ".JK" : symbol;

    fetch(`${API_BASE}/api/chart/cashflow/${t}?limit=10`)
      .then(r => r.json())
      .then(setJson);
  }, [symbol]);

  if (!json)
    return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div>
      <h3 className="font-semibold mb-3">
        Cashflow
      </h3>

      <div className="h-[340px]">
        <ResponsiveContainer>
          <BarChart data={json.chart}>
            <CartesianGrid stroke="#1e293b" />

            <XAxis
              dataKey="date"
              tickFormatter={formatQuarter}
              tick={{ fill: "#fff" }}
            />

            <YAxis tickFormatter={formatNumber} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="bg-white text-black p-3 rounded shadow text-sm">
                    <p className="font-semibold mb-1 text-black">
                      {formatQuarter(label)}
                    </p>

                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }}>
                        {p.name} :
                        {" "}
                        {formatNumber(p.value)}
                      </p>
                    ))}
                  </div>
                );
              }}
            />

            <Legend />

            <Bar
              dataKey="operating"
              fill="#6D28D9"
              name="Operating"
            />

            <Bar
              dataKey="investing"
              fill="#3B82F6"
              name="Investing"
            />

            <Bar
              dataKey="financing"
              fill="#EF4444"
              name="Financing"
            />
          </BarChart>
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

export default memo(CashflowChart);
