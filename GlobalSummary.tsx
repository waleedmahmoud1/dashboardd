import React from 'react';
import { AggregatedStats } from '../types';
import { formatCurrency, formatNumber } from '../utils';
import { TrendingUp, DollarSign, ShoppingBag, Target } from 'lucide-react';

interface Props {
  stats: AggregatedStats;
}

export const GlobalSummary: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-100 text-xs font-medium mb-1">إجمالي الصرف (الفترة المحددة)</p>
            <h3 className="text-2xl font-bold font-mono">{formatCurrency(stats.totalSpend)}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-100 text-xs font-medium mb-1">إجمالي الطلبات</p>
            <h3 className="text-2xl font-bold font-mono">{formatNumber(stats.totalPurchases)}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg shadow-pink-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-pink-100 text-xs font-medium mb-1">متوسط التكلفة للطلب</p>
            <h3 className="text-2xl font-bold font-mono">{formatCurrency(stats.cpr)}</h3>
          </div>
          <div className="p-2 bg-white/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

       <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-center">
         <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <p className="text-xs text-gray-500 font-medium">أفضل منصة (أقل تكلفة)</p>
         </div>
         <h3 className="text-xl font-bold text-gray-800">{stats.bestPlatform}</h3>
       </div>
    </div>
  );
};