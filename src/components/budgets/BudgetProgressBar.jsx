// src/components/budgets/BudgetProgressBar.jsx
export default function BudgetProgressBar({ percentage }) {
  // Clamp percentage between 0 and 100 for visual rendering
  const clampedPercentage = Math.min(Math.max(percentage || 0, 0), 100);

  let barColor = 'bg-green-400';
  if (percentage >= 50 && percentage < 75) {
    barColor = 'bg-yellow-400';
  } else if (percentage >= 75 && percentage <= 90) {
    barColor = 'bg-orange-400';
  } else if (percentage > 90) {
    barColor = 'bg-red-500';
  }

  return (
    <div className="w-full h-4 bg-gray-200 border-2 border-black overflow-hidden relative shadow-[4px_4px_0px_0px_#000] rounded-none">
      <div
        className={`h-full ${barColor} border-r-2 border-black transition-all duration-500 rounded-none`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}
