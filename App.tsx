import React, { useState, useMemo, useEffect } from 'react';
import { PROJECTS } from './constants';
import { DailyEntry, ProjectName, DateRangeOption, DateFilterState } from './types';
import { InputSection } from './components/InputSection';
import { ProjectSection } from './components/ProjectSection';
import { GlobalSummary } from './components/GlobalSummary';
import { calculateStats, isDateInRange, generateCSV, generateTSV } from './utils';
import { LayoutDashboard, Layers, Filter, Download, Upload, Save, FileSpreadsheet, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { DateFilter } from './components/DateFilter';

// Temporary type to handle "All Projects" selection
type ProjectSelection = ProjectName | 'ALL';

const STORAGE_KEY = 'media_buyer_analytics_data_v1';

// Simple Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-fade-in-up transition-all ${
      type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

function App() {
  // --- Global State ---
  const [entries, setEntries] = useState<DailyEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load data from storage:', e);
      return [];
    }
  });

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const [selectedProject, setSelectedProject] = useState<ProjectSelection>('ALL');
  
  // This global filter applies to the "Global Overview" only when a single project is selected.
  const [globalDateFilter, setGlobalDateFilter] = useState<DateFilterState>({
    option: DateRangeOption.TODAY,
  });

  // --- Handlers ---
  const handleAddEntry = (newEntry: Omit<DailyEntry, 'id'>) => {
    const entry: DailyEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
    };
    setEntries((prev) => [...prev, entry]);
    showToast('تمت إضافة السجل بنجاح', 'success');
  };

  const handleUpdateEntry = (updatedEntry: DailyEntry) => {
    setEntries((prev) => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    showToast('تم تحديث السجل', 'success');
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter(e => e.id !== id));
    showToast('تم حذف السجل', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // --- Data Management (Export/Import) ---
  
  // 1. Manual Save (Psychological reassurance + Force Write)
  const handleManualSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      showToast('تم حفظ جميع البيانات في المتصفح بنجاح', 'success');
    } catch (e) {
      showToast('فشل الحفظ، تأكد من مساحة التخزين', 'error');
    }
  };

  // 2. Export Backup (JSON)
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Media_Buyer_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تحميل النسخة الاحتياطية', 'success');
  };

  // 3. Export to Excel (CSV)
  const handleExportExcel = () => {
    if (entries.length === 0) {
      showToast('لا توجد بيانات للتصدير', 'error');
      return;
    }
    const csvContent = generateCSV(entries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_Excel_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('تم تحميل ملف Excel', 'success');
  };

  // 4. Copy for Google Sheets
  const handleCopyForSheets = async () => {
    if (entries.length === 0) {
      showToast('لا توجد بيانات للنسخ', 'error');
      return;
    }
    const tsvContent = generateTSV(entries);
    try {
      await navigator.clipboard.writeText(tsvContent);
      showToast('تم نسخ البيانات! افتح Google Sheets واضغط Ctrl+V', 'success');
    } catch (err) {
      showToast('فشل النسخ التلقائي', 'error');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(item => item.id && item.date && item.project);
          if (isValid) {
            if (confirm('سيتم استبدال البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
              setEntries(parsed);
              showToast('تم استعادة البيانات بنجاح', 'success');
            }
          } else {
            showToast('ملف غير صالح: تنسيق البيانات غير صحيح', 'error');
          }
        } else {
           showToast('ملف غير صالح', 'error');
        }
      } catch (error) {
        showToast('حدث خطأ أثناء قراءة الملف', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // --- Derived Data ---

  // 1. Filter entries by Project
  const projectEntries = useMemo(() => {
    if (selectedProject === 'ALL') {
      return entries;
    }
    return entries.filter(e => e.project === selectedProject);
  }, [entries, selectedProject]);

  // 2. Filter entries by Date (for Global Summary only)
  const globalSummaryEntries = useMemo(() => {
    return projectEntries.filter(e => isDateInRange(e.date, globalDateFilter));
  }, [projectEntries, globalDateFilter]);

  const globalStats = calculateStats(globalSummaryEntries);

  return (
    <div className="min-h-screen pb-20 bg-[#f8fafc]">
      
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header / Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-purple-600 to-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-200">
                <LayoutDashboard size={22} />
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 leading-tight font-tajawal">تتبّع الإعلانات</h1>
               <p className="text-xs text-gray-500">لوحة التحكم والمزامنة</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Primary Actions Group */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button 
                onClick={handleManualSave}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="حفظ البيانات في المتصفح يدوياً"
                >
                <Save size={16} className="text-blue-600" />
                <span className="hidden lg:inline">حفظ</span>
                </button>

                <div className="w-px h-5 bg-gray-200 mx-1"></div>

                <button 
                onClick={handleCopyForSheets}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="نسخ البيانات للصقها في Google Sheets"
                >
                <Copy size={16} className="text-green-600" />
                <span className="hidden lg:inline">نسخ لـ Sheets</span>
                </button>

                <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                title="تحميل كملف Excel"
                >
                <FileSpreadsheet size={16} className="text-green-700" />
                <span className="hidden lg:inline">ملف Excel</span>
                </button>
            </div>

            {/* Backup Group */}
            <div className="hidden sm:flex items-center gap-1 ml-2">
                <button 
                onClick={handleExportBackup}
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="تصدير نسخة احتياطية كاملة (JSON)"
                >
                <Download size={18} />
                </button>
                <label 
                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                title="استيراد نسخة احتياطية"
                >
                <Upload size={18} />
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Daily Input Section */}
        <InputSection onAddEntry={handleAddEntry} />

        <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between sticky top-20 z-20 bg-[#f8fafc]/90 backdrop-blur-md py-4 border-b border-gray-200/50">
          
          {/* Project Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar mask-linear-fade">
            <Filter size={18} className="text-gray-400 ml-2 flex-shrink-0" />
            <button
              onClick={() => setSelectedProject('ALL')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedProject === 'ALL'
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
              }`}
            >
              جميع المشاريع
            </button>
            {PROJECTS.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedProject(p)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  selectedProject === p
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105'
                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Global Date Filter (Only shows if Single Project is selected to control Summary) */}
          {selectedProject !== 'ALL' && (
             <div className="flex-shrink-0 animate-fade-in">
               <DateFilter value={globalDateFilter} onChange={setGlobalDateFilter} />
             </div>
          )}
        </div>

        {/* Global Overview (Only if Single Project Selected) */}
        {selectedProject !== 'ALL' && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
              <Layers size={16} />
              ملخص الأداء ({selectedProject})
            </h3>
            <GlobalSummary stats={globalStats} />
          </div>
        )}

        {/* Projects Feed */}
        <div className="space-y-12">
           {selectedProject === 'ALL' ? (
             PROJECTS.map(proj => (
               <ProjectSection 
                  key={proj} 
                  project={proj} 
                  entries={entries.filter(e => e.project === proj)} 
                  onUpdateEntry={handleUpdateEntry}
                  onDeleteEntry={handleDeleteEntry}
               />
             ))
           ) : (
             <ProjectSection 
                project={selectedProject} 
                entries={entries.filter(e => e.project === selectedProject)} 
                onUpdateEntry={handleUpdateEntry}
                onDeleteEntry={handleDeleteEntry}
               />
           )}
        </div>
        
        {entries.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mx-auto max-w-2xl">
            <div className="inline-flex p-5 bg-gray-50 rounded-full mb-6">
               <LayoutDashboard className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">مرحباً بك في لوحة التحليلات</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">ابدأ بإدخال بياناتك اليومية من النموذج في الأعلى، أو قم باستيراد نسخة احتياطية سابقة.</p>
            
            <div className="flex justify-center gap-4">
                <label className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm font-medium text-gray-700">
                    <Upload size={18} />
                    <span>استيراد ملف سابق</span>
                    <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
                </label>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;