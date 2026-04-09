import React from "react";

interface SuccessRecommendationProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const SuccessRecommendation: React.FC<SuccessRecommendationProps> = ({
  title,
  description,
  actionLabel = "Take Action",
  onAction,
}) => (
  <div className="sweep-border breathing-glow relative bg-slate-900 rounded-xl p-6 mb-6 select-none shadow-2xl transition-all duration-300">
    <div className="relative z-10">
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-300 mb-4">{description}</p>
      <button 
        onClick={onAction}
        className="px-5 py-2 font-semibold rounded-full bg-gradient-to-r from-[#b822e4] to-[#e97be4] text-white shadow-lg hover:opacity-90 transition"
      >
        {actionLabel}
      </button>
    </div>
  </div>
);

export default SuccessRecommendation;
