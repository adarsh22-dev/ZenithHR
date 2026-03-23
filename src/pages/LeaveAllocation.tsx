import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Plus, 
  Info, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaveAllocation() {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Allocation</h1>
          <p className="text-gray-500">Request additional leave balance or compensatory time off.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
        >
          <Plus size={20} />
          New Allocation Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Request History</h3>
            </div>
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                <FileText size={32} />
              </div>
              <p className="text-gray-500 font-medium">No allocation requests found.</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#151619] p-8 rounded-[40px] text-white">
            <div className="flex items-center gap-3 mb-6">
              <Info className="text-[#5A5A40]" size={24} />
              <h3 className="text-xl font-bold">Allocation Rules</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Compensatory Off</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Can be requested for working on weekends or public holidays. Must be approved by manager.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Extra Allocation</p>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Special requests for additional leave balance due to exceptional circumstances.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending</p>
                <p className="text-lg font-bold text-gray-900">0</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Approved (YTD)</p>
                <p className="text-lg font-bold text-gray-900">2 Days</p>
              </div>
            </div>
          </div>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">New Allocation Request</h3>
                <p className="text-gray-500 mb-8 font-medium">Request additional leave balance or compensatory time.</p>
                
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Allocation Type</label>
                    <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900">
                      <option>Compensatory Off</option>
                      <option>Extra Leave Allocation</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Days</label>
                      <input type="number" step="0.5" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900" placeholder="1.0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date Worked</label>
                      <input type="date" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reason</label>
                    <textarea className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-medium text-gray-900 min-h-[100px]" placeholder="Describe why you are requesting this allocation..." />
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
