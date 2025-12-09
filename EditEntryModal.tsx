import React, { useState, useEffect } from 'react';
import { DailyEntry, PlatformName, ProjectName } from '../types';
import { PLATFORMS, PROJECTS } from '../constants';
import { X, Save, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: DailyEntry) => void;
  onDelete: (id: string) => void;
  entry: DailyEntry | null;
}

export const EditEntryModal: React.FC<Props> = ({ isOpen, onClose, onSave, onDelete, entry }) => {
  const [formData, setFormData] = useState<DailyEntry | null>(null);

  useEffect(() => {
    if (entry) {
      setFormData({ ...entry });
    }
  }, [entry]);

  if (!isOpen || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟ لن تتمكن من التراجع عن هذا الإجراء.')) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-800">تعديل السجل</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">التاريخ</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
                  required
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">المشروع</label>
                <select
                  value={formData.project}
                  onChange={e => setFormData({...formData, project: e.target.value as ProjectName})}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
                >
                    {PROJECTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
          </div>

          <div>
             <label className="block text-xs font-semibold text-gray-500 mb-1">المنصة</label>
             <select
               value={formData.platform}
               onChange={e => setFormData({...formData, platform: e.target.value as PlatformName})}
               className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm"
             >
                 {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">الصرف (SAR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.spend}
                  onChange={e => setFormData({...formData, spend: parseFloat(e.target.value) || 0})}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm font-mono"
                />
             </div>
             <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">الطلبات</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.purchases}
                  onChange={e => setFormData({...formData, purchases: parseFloat(e.target.value) || 0})}
                  className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 text-sm font-mono"
                />
             </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2.5 px-4 rounded-xl transition-all"
            >
              <Trash2 size={16} />
              <span>حذف</span>
            </button>
            <button
              type="submit"
              className="flex-[2] flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-gray-200"
            >
              <Save size={16} />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};