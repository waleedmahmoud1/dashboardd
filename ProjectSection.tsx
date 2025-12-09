import React, { useState, useMemo } from 'react';
import { DailyEntry, ProjectName, DateRangeOption, DateFilterState, PlatformName } from '../types';
import { calculateStats, formatCurrency, formatNumber, isDateInRange } from '../utils';
import { DateFilter } from './DateFilter';
import { StatCard } from './StatCard';
import { DollarSign, ShoppingBag, TrendingUp, Award, BarChart3, PieChart as PieChartIcon, Activity, Edit2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, PieChart, Pie } from 'recharts';
import { PLATFORM_COLORS } from '../constants';
import { EditEntryModal } from './EditEntryModal';

interface Props {
  project: ProjectName;
  entries: DailyEntry[];
  onUpdateEntry: (entry: DailyEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const ProjectSection: React.FC<Props> = ({ project, entries, onUpdateEntry, onDeleteEntry }) => {
  // 1. Internal Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterState>({
    option: DateRangeOption.TODAY,
  });

  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);

  // 2. Filter Data
  const filteredEntries = useMemo(() => {
    return entries.filter(e => isDateInRange(e.date, dateFilter)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [entries, dateFilter]);

  // 3. Calculate Stats
  const stats = calculateStats(filteredEntries);

  // 4. Prepare Chart Data (Grouped by Date)
  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; spend: number; purchases: number; cpr: number }> = {};
    
    // Initialize with existing dates from entries to maintain continuity in the selected range
    filteredEntries.forEach(e => {
      if (!grouped[e.date]) {
        grouped[e.date] = { date: e.date, spend: 0, purchases: 0, cpr: 0 };
      }
      grouped[e.date].spend += e.spend;
      grouped[e.date].purchases += e.purchases;
    });

    return Object.values(grouped)
      .map(item => ({
        ...item,
        cpr: item.purchases > 0 ? parseFloat((item.spend / item.purchases).toFixed(2)) : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEntries]);

  // 5. Prepare Platform Breakdown Data
  const platformData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredEntries.forEach(e => {
        data[e.platform] = (data[e.platform] || 0) + e.spend; // Defaulting to Spend breakdown for Donut
    });
    return Object.keys(PLATFORM_COLORS).map(key => ({
        name: key,
        value: data[key] || 0
    }));
  }, [filteredEntries]);

  // Platform comparison for bar chart
  const platformComparisonData = useMemo(() => {
     const data: Record<string, {name: string, spend: number, purchases: number}> = {};
     Object.values(PlatformName).forEach(p => {
         data[p] = { name: p, spend: 0, purchases: 0 };
     });
     filteredEntries.forEach(e => {
         if(data[e.platform]) {
             data[e.platform].spend += e.spend;
             data[e.platform].purchases += e.purchases;
         }
     });
     return Object.values(data);
  }, [filteredEntries]);


  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden mb-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-800">{project}</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">لوحة المعلومات</span>
        </div>
        
        {/* Internal Date Filter */}
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="p-6">
        
        {/* Project Insights Box (Zeros default) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="إجمالي الصرف"
            value={formatCurrency(stats.totalSpend)}
            icon={<DollarSign size={20} />}
            colorClass="bg-red-50 text-red-500"
          />
          <StatCard
            title="إجمالي الطلبات"
            value={formatNumber(stats.totalPurchases)}
            icon={<ShoppingBag size={20} />}
            colorClass="bg-green-50 text-green-500"
          />
          <StatCard
            title="متوسط التكلفة للطلب"
            value={formatCurrency(stats.cpr)}
            icon={<TrendingUp size={20} />}
            colorClass="bg-blue-50 text-blue-500"
          />
          <StatCard
            title="أفضل منصة"
            value={stats.bestPlatform}
            subValue={stats.bestPlatform !== '-' ? 'أقل تكلفة للطلب' : ''}
            icon={<Award size={20} />}
            colorClass="bg-yellow-50 text-yellow-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Trend Chart */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <Activity size={16} className="text-purple-500"/>
                 أداء الصرف اليومي
               </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} stroke="#9ca3af" />
                  <YAxis tick={{fontSize: 10}} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    labelStyle={{color: '#374151', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="spend" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSpend)" name="الصرف" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CPR Trend */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <TrendingUp size={16} className="text-blue-500"/>
                 تطور تكلفة الطلب (CPR)
               </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCPR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} tickFormatter={(val) => val.slice(5)} stroke="#9ca3af" />
                  <YAxis tick={{fontSize: 10}} stroke="#9ca3af" />
                  <Tooltip 
                     contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Area type="monotone" dataKey="cpr" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCPR)" name="CPR" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
           {/* Platform Breakdown (Spend) */}
           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <PieChartIcon size={16} className="text-orange-500"/>
                 توزيع الصرف حسب المنصة
               </h3>
            </div>
            <div className="h-64 flex items-center justify-center">
                {stats.totalSpend === 0 ? (
                    <div className="text-gray-300 text-sm">لا توجد بيانات</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={platformData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name as PlatformName] || '#ccc'} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
          </div>

          {/* Platform Performance (Purchases Bar) */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <BarChart3 size={16} className="text-green-500"/>
                 الطلبات حسب المنصة
               </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#9ca3af" />
                  <YAxis tick={{fontSize: 10}} stroke="#9ca3af" />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="purchases" name="الطلبات" radius={[4, 4, 0, 0]}>
                    {platformComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name as PlatformName] || '#ccc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily Log Table */}
        <div className="overflow-x-auto">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            السجل اليومي
          </h3>
          <table className="min-w-full text-sm text-right">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500">
                <th className="py-3 px-4 font-medium">التاريخ</th>
                <th className="py-3 px-4 font-medium">المنصة</th>
                <th className="py-3 px-4 font-medium">الصرف</th>
                <th className="py-3 px-4 font-medium">الطلبات</th>
                <th className="py-3 px-4 font-medium">CPR</th>
                <th className="py-3 px-4 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    لا توجد بيانات لهذه الفترة
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-4 text-gray-700 font-mono text-xs">{entry.date}</td>
                    <td className="py-3 px-4">
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${PLATFORM_COLORS[entry.platform]}20`, color: PLATFORM_COLORS[entry.platform] }}>
                           {entry.platform}
                       </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{formatCurrency(entry.spend)}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{entry.purchases}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">
                      {entry.purchases > 0 ? formatCurrency(entry.spend / entry.purchases) : '-'}
                    </td>
                    <td className="py-3 px-4 text-left">
                       <button 
                         onClick={() => setEditingEntry(entry)}
                         className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                         title="تعديل"
                       >
                         <Edit2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditEntryModal 
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={onUpdateEntry}
        onDelete={onDeleteEntry}
        entry={editingEntry}
      />
    </div>
  );
};