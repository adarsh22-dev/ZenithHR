import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const deptData = [
  { name: 'Engineering', value: 45, color: '#5A5A40' },
  { name: 'HR', value: 15, color: '#8E9299' },
  { name: 'Marketing', value: 25, color: '#151619' },
  { name: 'Sales', value: 15, color: '#E6E6E6' },
];

const genderData = [
  { name: 'Male', value: 60, color: '#5A5A40' },
  { name: 'Female', value: 35, color: '#8E9299' },
  { name: 'Other', value: 5, color: '#E6E6E6' },
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

export default function EmployeeDashboard() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/stats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    })
    .then(data => setStats(data))
    .catch(err => console.error('Employee Dashboard Stats Error:', err));
  }, [token]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Dashboard</h1>
          <p className="text-gray-500">Overview of your workforce and department metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all">
            <UserPlus size={20} />
            Add Employee
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total Headcount" 
          value={stats?.totalEmployees || 0} 
          trend="+5.2%" 
          trendType="up"
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard 
          icon={UserPlus} 
          label="New Hires" 
          value="12" 
          trend="+2" 
          trendType="up"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Retention Rate" 
          value="94%" 
          trend="+1.2%" 
          trendType="up"
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={GraduationCap} 
          label="Avg. Tenure" 
          value="2.4y" 
          trend="-0.1y" 
          trendType="down"
          color="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Department Breakdown</h3>
          <div className="h-[350px] w-full relative min-h-[350px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F1F1" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} width={100} />
                  <Tooltip cursor={{ fill: '#F9FAFB' }} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Diversity Metrics</h3>
          <div className="h-[250px] w-full mb-8 relative min-h-[250px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-4">
            {genderData.map((item) => (
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
