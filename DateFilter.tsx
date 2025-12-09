import React from 'react';
import { DateFilterState, DateRangeOption } from '../types';
import { Calendar } from 'lucide-react';

interface Props {
  value: DateFilterState;
  onChange: (value: DateFilterState) => void;
}

export const DateFilter: React.FC<Props> = ({ value, onChange }) => {
  const options = Object.values(DateRangeOption);

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      option: e.target.value as DateRangeOption,
      // Reset custom dates if switching away from custom
      customStartDate: e.target.value === DateRangeOption.CUSTOM ? value.customStartDate : undefined,
      customEndDate: e.target.value === DateRangeOption.CUSTOM ? value.customEndDate : undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 px-2">
        <Calendar className="w-4 h-4 text-purple-500" />
        <span className="text-sm font-medium text-gray-600">الفترة:</span>
      </div>
      
      <select
        value={value.option}
        onChange={handleOptionChange}
        className="text-sm bg-gray-50 border-none rounded-lg py-1.5 pr-8 pl-3 focus:ring-2 focus:ring-purple-200 text-gray-700 font-medium cursor-pointer outline-none transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {value.option === DateRangeOption.CUSTOM && (
        <div className="flex items-center gap-2 mr-2 animate-fade-in">
          <input
            type="date"
            value={value.customStartDate || ''}
            onChange={(e) => onChange({ ...value, customStartDate: e.target.value })}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-purple-100 outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={value.customEndDate || ''}
            onChange={(e) => onChange({ ...value, customEndDate: e.target.value })}
            className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-purple-100 outline-none"
          />
        </div>
      )}
    </div>
  );
};