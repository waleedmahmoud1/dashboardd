import React from 'react';

interface Props {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  colorClass: string; // e.g. "bg-blue-100 text-blue-600"
}

export const StatCard: React.FC<Props> = ({ title, value, subValue, icon, colorClass }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 font-mono tracking-tight">{value}</h3>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1">{subValue}</p>
        )}
      </div>
    </div>
  );
};