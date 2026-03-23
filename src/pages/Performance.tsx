import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  TrendingUp, 
  Target, 
  Award, 
  MessageSquare, 
  Star,
  ChevronRight,
  Loader2,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Performance() {
  const { user, token } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr_manager';

  const stats = [
    { label: 'KPI Score', value: '4.8/5.0', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Goals Met', value: '12/15', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Reviews', value: '04', icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance</h1>
          <p className="text-gray-500">Track your growth, goals, and feedback.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
          >
            <Plus size={20} />
            Initiate Review
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <TrendingUp size={20} className="text-gray-300" />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recent Reviews</h3>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="p-20 text-center">
                <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                <p className="text-gray-500 font-medium">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-gray-500 font-medium">No performance reviews found.</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-8 hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer_id}`} alt="reviewer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{review.period} Review</p>
                        <p className="text-xs text-gray-500">Reviewer: {review.reviewer_first_name} {review.reviewer_last_name}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      review.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {review.status}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Score</p>
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-gray-900">{review.kpi_score || '--'}/5.0</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                        <span className="text-sm font-bold text-gray-900">{new Date(review.review_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-[#5A5A40] transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Current Goals</h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">Project Delivery</p>
                <span className="text-xs font-bold text-emerald-600">85%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%]" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">Skill Development</p>
                <span className="text-xs font-bold text-indigo-600">60%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[60%]" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-gray-900">Team Collaboration</p>
                <span className="text-xs font-bold text-amber-600">45%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]" />
              </div>
            </div>
          </div>
          <button className="w-full mt-10 py-4 rounded-2xl bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
            <Award size={18} />
            View All Goals
          </button>
        </div>
      </div>

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
                  <h2 className="text-2xl font-bold text-gray-900">Initiate Performance Review</h2>
                  <p className="text-gray-500">Start a new review cycle for an employee</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Employee</label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10">
                    <option>John Doe (EMP-001)</option>
                    <option>Jane Smith (EMP-002)</option>
                    <option>Mike Johnson (EMP-003)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Review Period</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10">
                      <option>Q1 2024</option>
                      <option>Q2 2024</option>
                      <option>Annual 2024</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</label>
                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10" />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Invitation
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
