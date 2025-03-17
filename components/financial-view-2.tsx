import React from "react";

interface TransactionItemProps {
  title: string;
  date: Date;
  time: string; // Changed to Date type
  category: string;
  amount: number;
  isCashOut: boolean; // true for cash out, false for cash in
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  title,
  date,
  time,
  category,
  amount,
  isCashOut,
}) => {
  const borderColor = isCashOut ? "border-red-500" : "border-green-500";
  const formattedDate = date.toLocaleDateString();

  return (
    <div
      className={`border-2 rounded-lg p-4 relative ${borderColor} mb-2 bg-[#f4f4f4] h-20 text-[#212121] w-1/2 min-w-80`} // mb-2 for spacing
    >
      <div className="absolute top-2 left-2 text-lg font-semibold">{title}</div>
      <div className="absolute top-2 right-2 text-sm">
        <div className="flex flex-row gap-4">
        <div>{formattedDate}</div>
        <div>{time}</div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 text-sm">
        {category}
      </div>
      <div className="absolute bottom-2 right-2 text-base font-medium">
        {isCashOut ? `₱${amount.toFixed(2)}` : `₱${amount.toFixed(2)}`}
      </div>
    </div>
  );
};

export default TransactionItem;
