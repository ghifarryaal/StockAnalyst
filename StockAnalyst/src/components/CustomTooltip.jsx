import { formatNumber, formatDate } from "./utils";

export default function CustomTooltip({ active, payload, label, percentKey }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white text-black p-3 rounded shadow text-sm">
      <p className="font-semibold mb-1">
        {formatDate(label)}
      </p>

      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} :
          {" "}
          {percentKey === p.dataKey
            ? p.value + " %"
            : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}
