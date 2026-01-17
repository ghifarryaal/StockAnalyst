import IncomeChart from "./FundamentalSlider";
import BalanceChart from "./BalanceChart";
import CashflowChart from "./CashflowChart";

const FundamentalSlider = ({ symbol }) => {
  return (
    <div
      className="
        flex overflow-x-auto snap-x snap-mandatory
        scrollbar-hide
      "
    >

      {/* LABA RUGI */}
      <div className="snap-center min-w-full px-4">
        <IncomeChart symbol={symbol} />
      </div>

      {/* NERACA */}
      <div className="snap-center min-w-full px-4">
        <BalanceChart symbol={symbol} />
      </div>

      {/* ARUS KAS */}
      <div className="snap-center min-w-full px-4">
        <CashflowChart symbol={symbol} />
      </div>

    </div>
  );
};

export default FundamentalSlider;
