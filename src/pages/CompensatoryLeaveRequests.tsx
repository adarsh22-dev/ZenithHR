import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  History, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompensatoryLeaveRequests() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Compensatory Leave</h1>
          <p className="text-gray-500">Manage and track leaves earned through extra working hours or weekend shifts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
        >
          <Plus size={20} />
          Request Comp-Off
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <History size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Comp-Off History</h3>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Worked</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comp-Off Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { worked: '2024-02-24 (Sat)', comp: '2024-03-15', reason: 'Weekend deployment support.', status: 'Approved' },
                { worked: '2024-03-02 (Sat)', comp: '2024-03-22', reason: 'Critical bug fixing.', status: 'Pending' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-900">{row.worked}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-900">{row.comp}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-gray-600 font-medium">{row.reason}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      row.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {row.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#151619]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Comp-Off</h3>
                <p className="text-gray-500 mb-8 font-medium">Claim leave for extra hours worked on weekends or holidays.</p>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date Worked</label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Comp-Off Date</label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reason / Task</label>
                    <textarea className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-medium text-gray-900 min-h-[100px]" placeholder="Describe the work performed..." />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all">Submit Request</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
