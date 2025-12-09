import React, { useState } from 'react';
import { PlatformName, ProjectName, DailyEntry } from '../types';
import { PLATFORMS, PROJECTS } from '../constants';
import { PlusCircle, Save } from 'lucide-react';
import { getTodayStr } from '../utils';

interface Props {
  onAddEntry: (entry: Omit<DailyEntry, 'id'>) => void;
}

export const InputSection: React.FC<Props> = ({ onAddEntry }) => {
  const [date, setDate] = useState(getTodayStr());
  const [project, setProject] = useState<ProjectName>(PROJECTS[0]);
  const [platform, setPlatform] = useState<PlatformName>(PLATFORMS[0]);
  const [spend, setSpend] = useState<string>('0');
  const [purchases, setPurchases] = useState<string>('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      date,
      project,
      platform,
      spend: parseFloat(spend) || 0,
      purchases: parseFloat(purchases) || 0,
    });
    // Reset numerical values but keep context
    setSpend('0');
    setPurchases('0');
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-3xl shadow-sm border border-blue-100 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-200">
          <PlusCircle size={20} />
        </div>
        <h2 className="text-lg font-bold text-gray-800">إدخال البيانات اليومية</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        {/* Date */}
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">التاريخ</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
            required
          />
        </div>

        {/* Project */}
        <div className="col-span-1 lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">المشروع</label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value as ProjectName)}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
          >
            {PROJECTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div className="col-span-1 lg:col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">المنصة</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as PlatformName)}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Spend */}
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">الصرف اليومي (SAR)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={spend}
            onChange={(e) => setSpend(e.target.value)}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm font-mono"
          />
        </div>

        {/* Purchases */}
        <div className="col-span-1">
          <label className="block text-xs font-semibold text-gray-500 mb-1">عدد الطلبات</label>
          <input
            type="number"
            min="0"
            step="1"
            value={purchases}
            onChange={(e) => setPurchases(e.target.value)}
            className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm font-mono"
          />
        </div>

        {/* Submit */}
        <div className="col-span-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            <Save size={16} />
            <span>حفظ الإدخال</span>
          </button>
        </div>
      </form>
    </div>
  );
};