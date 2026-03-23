import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Plus, 
  Loader2,
  Filter,
  Search,
  ChevronRight,
  Gift,
  Sun,
  Moon,
  Star,
  X,
  Save,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { validateForm } from '../utils/validation';

export default function Holidays() {
  const { user, token } = useAuthStore();
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<any | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Public'
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await fetch('/api/holidays', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch holidays');
      const data = await res.json();
      setHolidays(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    setFieldErrors({});
    
    const errors = validateForm(formData, {
      name: [{ type: 'required' }],
      date: [{ type: 'required' }, { type: 'date' }]
    });

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFieldErrors(errorMap);
      return;
    }
    
    if (editingHoliday && !showSaveConfirm) {
      setShowSaveConfirm(true);
      return;
    }

    setSubmitting(true);
    try {
      const url = editingHoliday ? `/api/holidays/${editingHoliday.id}` : '/api/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setEditingHoliday(null);
        setShowSaveConfirm(false);
        setFormData({ name: '', date: '', type: 'Public' });
        fetchHolidays();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (holiday: any) => {
    setEditingHoliday(holiday);
    setFormData({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type
    });
    setShowAddModal(true);
  };

  const handleDeleteHoliday = async (id: number) => {
    try {
      const res = await fetch(`/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteConfirmId(null);
        fetchHolidays();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingHolidays = holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 3);

  const getDaysToGo = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const holidayDate = new Date(date);
    holidayDate.setHours(0, 0, 0, 0);
    const diffTime = holidayDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Holidays</h1>
          <p className="text-gray-500">View upcoming public and company holidays for the year.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
          >
            <Plus size={20} />
            Add Holiday
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                  <Calendar size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Holiday Calendar 2024</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search holidays..." 
                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holiday Name</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                    {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                      <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                        <p className="text-gray-500 font-medium">Loading holidays...</p>
                      </td>
                    </tr>
                  ) : holidays.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <p className="text-gray-500 font-medium">No holidays found for this year.</p>
                      </td>
                    </tr>
                  ) : (
                    holidays.map((holiday) => (
                      <tr key={holiday.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                              <Gift size={18} />
                            </div>
                            <p className="text-sm font-bold text-gray-900">{holiday.name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-900">{new Date(holiday.date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long' })}
                          </p>
                        </td>
                        <td className="px-8 py-6">
                          {getDaysToGo(holiday.date) < 0 ? (
                            <span className="text-xs text-gray-400 font-medium">Passed</span>
                          ) : getDaysToGo(holiday.date) === 0 ? (
                            <span className="text-xs text-[#5A5A40] font-bold">Today!</span>
                          ) : (
                            <span className="text-xs text-gray-600 font-medium">{getDaysToGo(holiday.date)} days left</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            holiday.type === 'Public' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {holiday.type}
                          </div>
                        </td>
                        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <AnimatePresence mode="wait">
                                {deleteConfirmId === holiday.id ? (
                                  <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="flex items-center gap-2"
                                  >
                                    <button 
                                      onClick={() => handleDeleteHoliday(holiday.id)}
                                      className="px-3 py-1.5 bg-rose-600 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-rose-700 transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button 
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => handleEditClick(holiday)}
                                      className="p-2 text-gray-400 hover:text-[#5A5A40] hover:bg-gray-50 rounded-xl transition-all"
                                      title="Edit Holiday"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    <motion.button 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      onClick={() => setDeleteConfirmId(holiday.id)}
                                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                      title="Delete Holiday"
                                    >
                                      <Trash2 size={18} />
                                    </motion.button>
                                  </div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#151619] p-8 rounded-[40px] text-white">
            <h3 className="text-xl font-bold mb-8">Upcoming Holidays</h3>
            <div className="space-y-6">
              {upcomingHolidays.length > 0 ? upcomingHolidays.map((h, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center group-hover:bg-[#5A5A40] transition-all">
                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-white/70 uppercase leading-none mb-1">
                      {new Date(h.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {new Date(h.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold truncate">{h.name}</p>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${
                        h.type === 'Public' ? 'bg-emerald-500/20 text-emerald-400' : 
                        h.type === 'Company' ? 'bg-indigo-500/20 text-indigo-400' : 
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {h.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <span className="text-[10px] text-[#5A5A40] font-bold">
                        • {getDaysToGo(h.date)} {getDaysToGo(h.date) === 1 ? 'day' : 'days'} left
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                </div>
              )) : (
                <p className="text-gray-500 text-sm italic">No upcoming holidays found.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Holiday Policy</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mt-0.5">
                  <Star size={12} className="fill-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Employees are entitled to all public holidays as per the regional calendar.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mt-0.5">
                  <Star size={12} className="fill-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Optional holidays can be requested through the Leave management module.
                </p>
              </div>
            </div>
            <button className="w-full mt-8 py-4 rounded-2xl bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
              Download Full Policy
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Save size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Changes</h3>
              <p className="text-gray-500 mb-8">Are you sure you want to save the changes to this holiday?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddHoliday}
                  className="flex-1 py-3 rounded-xl bg-[#5A5A40] text-white font-bold hover:bg-[#4A4A35] transition-all"
                >
                  Yes, Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{editingHoliday ? 'Edit Holiday' : 'Add Holiday'}</h2>
                  <p className="text-gray-500">{editingHoliday ? 'Update existing holiday details' : 'Create a new public or company holiday'}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingHoliday(null);
                    setFormData({ name: '', date: '', type: 'Public' });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Holiday Name</label>
                   <input 
                    type="text" 
                    className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.name ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`} 
                    placeholder="e.g. Independence Day"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {fieldErrors.name && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.date ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    {fieldErrors.date && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.date}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option>Public</option>
                      <option>Company</option>
                      <option>Optional</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingHoliday(null);
                      setFormData({ name: '', date: '', type: 'Public' });
                    }}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddHoliday}
                    disabled={submitting}
                    className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {editingHoliday ? 'Update Holiday' : 'Save Holiday'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
