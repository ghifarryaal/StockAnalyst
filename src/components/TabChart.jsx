import { useState } from "react";
import StockChart from "./StockChart";
import IncomeChart from "./IncomeChart";
import BalanceChart from "./BalanceChart";
import CashflowChart from "./CashflowChart";

export default function TabChart({ symbol, onError }) {
  const [tab, setTab] = useState("price");

  const tabs = [
    { key: "price", label: "Price" },
    { key: "income", label: "Income" },
    { key: "balance", label: "Balance" },
    { key: "cashflow", label: "Cashflow" }
  ];

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700">

      {/* TAB HEADER */}
      <div className="flex border-b border-gray-700">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
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

      {/* CONTENT (KEEP MOUNTED) */}
      <div className="p-6 min-h-[420px]">

        {/* PRICE */}
        <div className={tab === "price" ? "block" : "hidden"}>
          <StockChart
            symbol={symbol}
            onError={onError}
          />
        </div>

        {/* INCOME */}
        <div className={tab === "income" ? "block" : "hidden"}>
          <IncomeChart
            symbol={symbol}
            onError={onError}
          />
        </div>

        {/* BALANCE */}
        <div className={tab === "balance" ? "block" : "hidden"}>
          <BalanceChart
            symbol={symbol}
            onError={onError}
          />
        </div>

        {/* CASHFLOW */}
        <div className={tab === "cashflow" ? "block" : "hidden"}>
          <CashflowChart
            symbol={symbol}
            onError={onError}
          />
        </div>

      </div>
    </div>
  );
}
