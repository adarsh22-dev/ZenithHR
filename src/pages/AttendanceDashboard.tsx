import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const attendanceTrend = [
  { name: 'Mon', present: 92, late: 5 },
  { name: 'Tue', present: 94, late: 3 },
  { name: 'Wed', present: 88, late: 8 },
  { name: 'Thu', present: 95, late: 2 },
  { name: 'Fri', present: 91, late: 6 },
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

export default function AttendanceDashboard() {
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Dashboard</h1>
          <p className="text-gray-500">Real-time monitoring of employee presence and work hours.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={CheckCircle2} 
          label="Present Today" 
          value="142" 
          trend="+4" 
          trendType="up"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Late Arrivals" 
          value="8" 
          trend="-2" 
          trendType="down"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={XCircle} 
          label="Absent" 
          value="5" 
          trend="+1" 
          trendType="up"
          color="bg-rose-50 text-rose-600"
        />
        <StatCard 
          icon={Timer} 
          label="Avg. Work Hours" 
          value="8.4h" 
          trend="+0.2h" 
          trendType="up"
          color="bg-indigo-50 text-indigo-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Weekly Attendance Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#5A5A40]" />
                <span className="text-xs font-bold text-gray-500 uppercase">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-gray-500 uppercase">Late</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full relative min-h-[350px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip cursor={{ fill: '#F9FAFB' }} />
                  <Bar dataKey="present" fill="#5A5A40" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Today's Status</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">On Time</span>
                <span className="text-lg font-bold text-emerald-700">92%</span>
              </div>
              <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]" />
              </div>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Late</span>
                <span className="text-lg font-bold text-amber-700">6%</span>
              </div>
              <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[6%]" />
              </div>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Absent</span>
                <span className="text-lg font-bold text-rose-700">2%</span>
              </div>
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[2%]" />
              </div>
            </div>
          </div>
          <button className="w-full mt-8 py-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-100 transition-all">
            View Detailed Logs
          </button>
        </div>
      </div>
    </div>
  );
}
