import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  ChevronRight,
  Settings2,
  Save,
  X,
  Loader2,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { validateForm } from '../utils/validation';

const leaveTypeData = [
  { name: 'Annual', value: 45, color: '#5A5A40' },
  { name: 'Sick', value: 25, color: '#8E9299' },
  { name: 'Maternity', value: 15, color: '#151619' },
  { name: 'Other', value: 15, color: '#E6E6E6' },
];

const leaveTrend = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 18 },
  { name: 'Mar', value: 15 },
  { name: 'Apr', value: 22 },
  { name: 'May', value: 30 },
  { name: 'Jun', value: 25 },
];

function StatCard({ icon: Icon, label, value, trend, trendType, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
          trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  );
}

export default function LeaveDashboard() {
  const { user, token } = useAuthStore();
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  
  const [requestData, setRequestData] = useState({
    type: 'Annual',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    setMounted(true);
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const res = await fetch('/api/leave-balances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch balances');
      const data = await res.json();
      setBalances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = (balance: any) => {
    setSelectedBalance({ ...balance });
    setFieldErrors({});
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedBalance) return;

    // Basic validation for numbers
    const errors: Record<string, string> = {};
    const fields = [
      'annual_total', 'annual_used', 
      'sick_total', 'sick_used', 
      'personal_total', 'personal_used'
    ];
    
    fields.forEach(field => {
      if (selectedBalance[field] < 0) {
        errors[field] = 'Cannot be negative';
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/leave-balances/${selectedBalance.employee_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedBalance)
      });
      if (res.ok) {
        setShowAdjustModal(false);
        fetchBalances();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestLeave = async () => {
    const errors = validateForm(requestData, {
      start_date: [{ type: 'required' }, { type: 'date' }],
      end_date: [{ type: 'required' }, { type: 'date' }],
      reason: [{ type: 'required' }]
    });

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFieldErrors(errorMap);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...requestData,
          employee_id: user?.employee_id
        })
      });

      if (res.ok) {
        setShowRequestModal(false);
        setRequestData({ type: 'Annual', start_date: '', end_date: '', reason: '' });
        setFieldErrors({});
        // Optionally refresh some list if needed
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Dashboard</h1>
          <p className="text-gray-500">Manage leave requests and track employee time off.</p>
        </div>
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'hr_manager') && (
            <button 
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              <Settings2 size={20} />
              Policy Settings
            </button>
          )}
          <button 
            onClick={() => {
              setShowRequestModal(true);
              setFieldErrors({});
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Clock} 
          label="Pending Requests" 
          value="14" 
          trend="+3" 
          trendType="up"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={Calendar} 
          label="On Leave Today" 
          value="6" 
          trend="-2" 
          trendType="down"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Approved (MTD)" 
          value="28" 
          trend="+12%" 
          trendType="up"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={XCircle} 
          label="Rejected (MTD)" 
          value="3" 
          trend="-1" 
          trendType="down"
          color="bg-rose-50 text-rose-600"
        />
      </div>

      {(user?.role === 'admin' || user?.role === 'hr_manager') && (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Settings2 size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Manual Leave Adjustments</h3>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Annual (Total/Used)</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Sick (Total/Used)</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Personal (Total/Used)</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center">
                      <Loader2 className="animate-spin text-[#5A5A40] mx-auto" />
                    </td>
                  </tr>
                ) : balances.map((balance) => (
                  <tr key={balance.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{balance.first_name} {balance.last_name}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-900">{balance.annual_total}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {balance.annual_used}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-900">{balance.sick_total}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {balance.sick_used}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-gray-900">{balance.personal_total}</span>
                      <span className="text-xs text-gray-400 ml-1">/ {balance.personal_used}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleAdjust(balance)}
                        className="px-4 py-2 bg-gray-50 text-[#5A5A40] text-xs font-bold rounded-xl hover:bg-[#5A5A40] hover:text-white transition-all"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAdjustModal && selectedBalance && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Adjust Leave Balance</h2>
                  <p className="text-gray-500">Updating balance for {selectedBalance.first_name} {selectedBalance.last_name}</p>
                </div>
                <button 
                  onClick={() => setShowAdjustModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  {/* Annual Leave */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest">Annual Leave</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Total Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.annual_total}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, annual_total: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.annual_total ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.annual_total && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.annual_total}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Used Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.annual_used}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, annual_used: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.annual_used ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.annual_used && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.annual_used}</p>}
                    </div>
                  </div>

                  {/* Sick Leave */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest">Sick Leave</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Total Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.sick_total}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, sick_total: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.sick_total ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.sick_total && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.sick_total}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Used Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.sick_used}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, sick_used: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.sick_used ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.sick_used && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.sick_used}</p>}
                    </div>
                  </div>

                  {/* Personal Leave */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[#5A5A40] uppercase tracking-widest">Personal Leave</h4>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Total Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.personal_total}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, personal_total: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.personal_total ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.personal_total && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.personal_total}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Used Days</label>
                      <input 
                        type="number" 
                        value={selectedBalance.personal_used}
                        onChange={(e) => setSelectedBalance({ ...selectedBalance, personal_used: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.personal_used ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      />
                      {fieldErrors.personal_used && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.personal_used}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowAdjustModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveAdjustment}
                    disabled={submitting}
                    className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Request Leave</h2>
                  <p className="text-gray-500">Submit a new time-off request</p>
                </div>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Leave Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                    value={requestData.type}
                    onChange={(e) => setRequestData({ ...requestData, type: e.target.value })}
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.start_date ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={requestData.start_date}
                      onChange={(e) => setRequestData({ ...requestData, start_date: e.target.value })}
                    />
                    {fieldErrors.start_date && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.start_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.end_date ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={requestData.end_date}
                      onChange={(e) => setRequestData({ ...requestData, end_date: e.target.value })}
                    />
                    {fieldErrors.end_date && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.end_date}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reason</label>
                  <textarea 
                    className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.reason ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10 min-h-[100px] resize-none`}
                    placeholder="Briefly explain the reason for your leave..."
                    value={requestData.reason}
                    onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  />
                  {fieldErrors.reason && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.reason}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRequestLeave}
                    disabled={submitting}
                    className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Leave Application Trend</h3>
          <div className="h-[350px] w-full relative min-h-[350px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <LineChart data={leaveTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#5A5A40" strokeWidth={3} dot={{ r: 6, fill: '#5A5A40', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Leave Type Distribution</h3>
          <div className="h-[250px] w-full mb-8 relative min-h-[250px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <PieChart>
                  <Pie
                    data={leaveTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leaveTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-4">
            {leaveTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
