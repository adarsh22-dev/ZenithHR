import React, { useState } from 'react';
import { BarChart3, Download, Filter, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Jan', employees: 45, turnover: 2 },
  { name: 'Feb', employees: 52, turnover: 1 },
  { name: 'Mar', employees: 48, turnover: 4 },
  { name: 'Apr', employees: 61, turnover: 0 },
  { name: 'May', employees: 55, turnover: 2 },
  { name: 'Jun', employees: 67, turnover: 1 },
];

const COLORS = ['#5A5A40', '#8A8A60', '#BABA90', '#EAEA30'];

export default function Reports() {
  const { user } = useAuthStore();
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (user?.role !== 'admin' && user?.role !== 'hr_manager') {
    return <Navigate to="/" />;
  }

  const handleExportPDF = () => {
    alert('Generating PDF report... This feature will be available in the production environment.');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500">Gain insights into your workforce performance and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              showFilters ? 'bg-[#5A5A40] text-white' : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-4 py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-medium hover:bg-[#4A4A35] transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Date Range</label>
                <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Department</label>
                <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm">
                  <option>All Departments</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-2 bg-[#5A5A40] text-white rounded-xl text-sm font-bold"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Retention Rate', value: '98.2%', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Avg. Attendance', value: '94.5%', icon: Calendar, color: 'text-blue-600 bg-blue-50' },
          { label: 'Payroll Growth', value: '+12.4%', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
          { label: 'KPI Progress', value: '88%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workforce Growth */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Workforce Growth</h3>
          <div className="flex-1 w-full relative min-h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="employees" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Turnover Trends */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm min-h-[450px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Employee Turnover</h3>
          <div className="flex-1 w-full relative min-h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Line type="monotone" dataKey="turnover" stroke="#ef4444" strokeWidth={3} dot={{r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff'}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
