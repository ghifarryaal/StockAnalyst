import { useState } from "react";
import StockChart from "./StockChart";
import IncomeChart from "./IncomeChart";
import BalanceChart from "./BalanceChart";
import CashflowChart from "./CashflowChart";

/**
 * TabChart — lazy-loads financial tabs.
 * Price chart always renders immediately.
 * Income / Balance / Cashflow hanya di-mount saat tab pertama kali diklik
 * sehingga tidak ada 3 API call bersamaan saat chart pertama tampil.
 */
export default function TabChart({ symbol, onError }) {
  const [tab, setTab] = useState("price");
  // Track tab mana yang pernah dikunjungi (sudah di-mount)
  const [visited, setVisited] = useState({ price: true });

  const tabs = [
    { key: "price", label: "Price" },
    { key: "income", label: "Income" },
    { key: "balance", label: "Balance" },
    { key: "cashflow", label: "Cashflow" }
  ];

  const handleTabClick = (key) => {
    setTab(key);
    // Tandai tab sebagai sudah pernah dikunjungi
    if (!visited[key]) {
      setVisited(prev => ({ ...prev, [key]: true }));
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">

      {/* TAB HEADER */}
      <div className="flex border-b border-gray-700">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabClick(t.key)}
            className={`flex-1 py-3 text-sm font-semibold transition
              ${tab === t.key
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-gray-200"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT — lazy mount: hanya render jika tab sudah pernah diklik */}
      <div className="p-6 min-h-[420px]">

        {/* PRICE — selalu di-mount */}
        <div className={tab === "price" ? "block" : "hidden"}>
          <StockChart symbol={symbol} onError={onError} />
        </div>

        {/* INCOME — lazy mount */}
        {visited.income && (
          <div className={tab === "income" ? "block" : "hidden"}>
            <IncomeChart symbol={symbol} onError={onError} />
          </div>
        )}

        {/* BALANCE — lazy mount */}
        {visited.balance && (
          <div className={tab === "balance" ? "block" : "hidden"}>
            <BalanceChart symbol={symbol} onError={onError} />
          </div>
        )}

        {/* CASHFLOW — lazy mount */}
        {visited.cashflow && (
          <div className={tab === "cashflow" ? "block" : "hidden"}>
            <CashflowChart symbol={symbol} onError={onError} />
          </div>
        )}

      </div>
    </div>
  );
}
